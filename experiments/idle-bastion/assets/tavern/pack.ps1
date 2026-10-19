# Deterministic atlas packing only. Original generated RGBA stays unchanged.
Add-Type -AssemblyName System.Drawing
$source = [System.Drawing.Bitmap]::new((Join-Path $PSScriptRoot 'raw/tavern-i.png'))
$left = $source.Width; $top = $source.Height; $right = 0; $bottom = 0
for ($y=0; $y -lt $source.Height; $y++) {
  for ($x=0; $x -lt $source.Width; $x++) {
    if ($source.GetPixel($x,$y).A -ge 128) {
      $left=[Math]::Min($left,$x); $right=[Math]::Max($right,$x)
      $top=[Math]::Min($top,$y); $bottom=[Math]::Max($bottom,$y)
    }
  }
}
$width=$right-$left+1; $height=$bottom-$top+1
$targetWidth=100; $targetHeight=[Math]::Round($height*$targetWidth/$width)
$target=[System.Drawing.Bitmap]::new(128,128)
for ($y=0; $y -lt $targetHeight; $y++) {
  for ($x=0; $x -lt $targetWidth; $x++) {
    $pixel=$source.GetPixel($left+[Math]::Floor(($x+0.5)*$width/$targetWidth),$top+[Math]::Floor(($y+0.5)*$height/$targetHeight))
    if ($pixel.A -ge 128) { $target.SetPixel(14+$x,112-$targetHeight+$y,[System.Drawing.Color]::FromArgb(255,$pixel.R,$pixel.G,$pixel.B)) }
  }
}
$target.Save((Join-Path $PSScriptRoot 'tavern-i.png'),[System.Drawing.Imaging.ImageFormat]::Png)
Write-Output "source=$($source.Width)x$($source.Height); crop=$left,$top,$width,$height; silhouette=${targetWidth}x${targetHeight}; frame=128x128; anchor=64,112"
$target.Dispose(); $source.Dispose()
