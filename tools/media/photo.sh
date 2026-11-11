#!/bin/zsh
# 写真をサイト用の WebP にする（幅を指定して縮める。向きは写真の情報どおり）。
#   zsh tools/media/photo.sh <元の写真> <出力名> [幅px…]
#   例: zsh tools/media/photo.sh ~/素材/IMG_1234.jpg menu-1 640 1280  → public/media/menu-1-640.webp, menu-1-1280.webp
# 必要なもの: cwebp（brew install webp）。HEIC は先に sips -s format jpeg で jpg にする。
set -e
cd "${0:A:h}/../.."
IN=$1; NAME=$2; shift 2
[[ -z $IN || -z $NAME ]] && { sed -n 2,5p "$0"; exit 1; }
for W in ${@:-1200}; do
  cwebp -quiet -metadata none -q 80 -resize $W 0 "$IN" -o public/media/$NAME-$W.webp
  echo public/media/$NAME-$W.webp
done
