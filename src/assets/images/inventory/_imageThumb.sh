#!/bin/bash

# cd ./src/assets/images/inventory  
# ./_imageThumb.sh 
# cd ../../../..  


set -e

mkdir -p thumbs

for f in *.jpg; do
  sips -z 400 400 "$f" --out "thumbs/$f"
done
