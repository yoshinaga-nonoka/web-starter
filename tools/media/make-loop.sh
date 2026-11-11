#!/bin/zsh
# 撮影した動画から、サイト用の音なしループ動画（mp4）とポスター画像（webp）を作る。Film.astro で使う。
#
#   zsh tools/media/make-loop.sh <元の動画> <出力名> [開始秒] [長さ秒] [幅px] [方式]
#   例: zsh tools/media/make-loop.sh ~/素材/IMG_1234.MOV hero 3 8 720
#       → public/media/hero.mp4 と public/media/hero.webp
#
# 方式: xloop（既定。最後の1秒を最初に溶かして、つなぎ目なく回す）／ pingpong（ゆっくり動くカメラを往復させる）
# iPhone の動画（HLG HDR）は、そのままだと色が飛ぶので、先に macOS の avconvert で SDR にする（自動）。
# 必要なもの: ffmpeg, cwebp（brew install ffmpeg webp）。容量の目安: 1本 1〜2MB。重いときは幅か長さを減らす。
set -e
cd "${0:A:h}/../.."
IN=$1; NAME=$2; ST=${3:-0}; DU=${4:-8}; W=${5:-720}; MODE=${6:-xloop}
[[ -z $IN || -z $NAME ]] && { sed -n 2,11p "$0"; exit 1; }
TMP=.out/media; mkdir -p $TMP public/media
ENC=(-c:v libx264 -preset slow -crf ${CRF:-28} -profile:v high -pix_fmt yuv420p -movflags +faststart -an -color_primaries bt709 -color_trc bt709 -colorspace bt709)

# 1. HDR なら SDR に（avconvert は macOS 標準）
SRC=$IN
if ffprobe -v error -select_streams v:0 -show_entries stream=color_transfer -of csv=p=0 "$IN" | grep -qE 'arib-std-b67|smpte2084'; then
  avconvert -s "$IN" -p Preset1920x1080 --start $ST --duration $(( DU + 2 )) -o $TMP/$NAME-sdr.mp4 --replace >/dev/null
  SRC=$TMP/$NAME-sdr.mp4; ST=0
fi

# 2. ループにする
if [[ $MODE == pingpong ]]; then
  ffmpeg -v error -y -ss $ST -t $DU -i "$SRC" -filter_complex \
    "[0:v]fps=30,scale=$W:-2:flags=lanczos,split[a][b];[b]reverse,trim=start_frame=1,setpts=PTS-STARTPTS[r];[a][r]concat=n=2:v=1:a=0,format=yuv420p[o]" \
    -map "[o]" $ENC public/media/$NAME.mp4
else
  F=1; END=$(echo "$DU + $F" | bc -l); OFF=$(echo "$DU - $F" | bc -l)
  ffmpeg -v error -y -ss $ST -t $(echo "$DU + $F" | bc -l) -i "$SRC" -filter_complex \
    "[0:v]fps=30,scale=$W:-2:flags=lanczos,split[a][b];[a]trim=start=$F:end=$END,setpts=PTS-STARTPTS[m];[b]trim=start=0:end=$F,setpts=PTS-STARTPTS[h];[m][h]xfade=transition=fade:duration=$F:offset=$OFF,format=yuv420p[o]" \
    -map "[o]" $ENC public/media/$NAME.mp4
fi

# 3. ポスター（ループの最初の1コマ）
ffmpeg -v error -y -i public/media/$NAME.mp4 -frames:v 1 -c:v png $TMP/$NAME.png
cwebp -quiet -q 78 $TMP/$NAME.png -o public/media/$NAME.webp
ls -la public/media/$NAME.mp4 public/media/$NAME.webp
