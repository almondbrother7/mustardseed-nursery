#!/bin/bash

# cd ./src/assets/images/inventory  
# ./_imageSizer.sh 
# cd ../../../..  

#!/bin/bash
set -e

# Set target dimensions for 4:3 aspect ratio
TARGET_WIDTH=800
TARGET_HEIGHT=600

mkdir -p resized

for file in *.[Jj][Pp][Gg]; do
  # Skip if no matching files
  [ -e "$file" ] || continue

  # Get filename without extension
  filename=$(basename "$file")
  name="${filename%.*}"
  output="resized/${name}.jpg"

  echo "Processing $file → $output"

  # Step 1: Resize while preserving aspect ratio
  sips -Z 1000 "$file" --out "$output"

  # Step 2: Center crop to 800x600 (4:3)
  sips --cropToHeightWidth $TARGET_HEIGHT $TARGET_WIDTH "$output"
done

echo "✅ Done. Resized files saved in 'resized/'"
