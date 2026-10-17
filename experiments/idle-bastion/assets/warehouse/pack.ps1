# Deterministic runtime packing only: preserve raw alpha; nearest sample to pixel grid.
Add-Type -AssemblyName System.Drawing
$source = [System.Drawing.Bitmap]::new((Join-Path $PSScriptRoot 'raw/warehouse-i.png'))
$target = [System.Drawing.Bitmap]::new(96, 96)
for ($y=0; $y -lt 50; $y++) {
  for ($x=0; $x -lt 68; $x++) {
    $pixel = $source.GetPixel(288 + [Math]::Floor(($x + 0.5) * 761 / 68), 397 + [Math]::Floor(($y + 0.5) * 560 / 50))
    if ($pixel.A -ge 128) { $target.SetPixel(14 + $x, 30 + $y, [System.Drawing.Color]::FromArgb(255, $pixel.R, $pixel.G, $pixel.B)) }
  }
}
$target.Save((Join-Path $PSScriptRoot 'warehouse-i.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$target.Dispose()
$source.Dispose()
