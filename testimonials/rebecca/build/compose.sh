#!/usr/bin/env bash
# compose.sh <workdir> <overlay_frames_dir> <out.mp4>
set -euo pipefail
W=$1; OV=$2; OUT=$3; DLG=${4:-}
if [ -n "$DLG" ]; then AIN=(-i "$DLG"); DA="[4:a]highpass=f=90,equalizer=f=3000:t=q:w=1.2:g=2"; else AIN=(); DA="[0:a]anull"; fi
ffmpeg -v error -stats -y -i "$W/base.mkv" -framerate 30 -i "$OV/%05d.png" -i "$W/music.wav" -i "$W/sfx.wav" "${AIN[@]}" -filter_complex "
[0:v]huesaturation=colors=g:saturation=-0.75:intensity=-0.08:strength=6,huesaturation=colors=c:saturation=-0.4:strength=4[g];
[g][1:v]overlay=format=auto:shortest=1,format=yuv420p[vo];
${DA},acompressor=threshold=-22dB:ratio=3:attack=5:release=150:makeup=2,asplit[d1][d2];
[2:a]volume=-12dB[m];[m][d2]sidechaincompress=threshold=0.04:ratio=4:attack=30:release=450[md];
[3:a]volume=4dB[s];
[d1][md][s]amix=inputs=3:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=9,aresample=48000[ao]" \
 -map "[vo]" -map "[ao]" -c:v libx264 -preset slow -crf 18 -profile:v high -pix_fmt yuv420p -r 30 \
 -color_primaries bt709 -color_trc bt709 -colorspace bt709 -movflags +faststart -c:a aac -b:a 256k -ar 48000 "$OUT"
