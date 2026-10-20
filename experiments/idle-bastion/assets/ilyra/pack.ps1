param()
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$manifest = Get-Content -LiteralPath (Join-Path $PSScriptRoot 'packing.json') -Raw | ConvertFrom-Json
$atlas = [Drawing.Bitmap]::new(512, 256, [Drawing.Imaging.PixelFormat]::Format32bppArgb)
$images = @{}
$report = @()
try {
    foreach ($frame in $manifest.frames) {
        $column = $frame.id % 8
        $row = [Math]::Floor($frame.id / 8)
        $minX=64; $minY=64; $maxX=-1; $maxY=-1; $count=0
        if ($null -eq $frame.mirrorOf -and -not $images.ContainsKey($frame.source)) {
            $images[$frame.source] = [Drawing.Bitmap]::new((Join-Path $PSScriptRoot ('sources/' + $frame.source)))
        }
        for ($y=0; $y -lt 64; $y++) {
            for ($x=0; $x -lt 64; $x++) {
                $color = [Drawing.Color]::Transparent
                if ($null -ne $frame.mirrorOf) {
                    $sourceX = ($frame.mirrorOf % 8) * 64 + 63 - $x
                    $sourceY = [Math]::Floor($frame.mirrorOf / 8) * 64 + $y
                    $color = $atlas.GetPixel($sourceX, $sourceY)
                } else {
                    $sx = [int][Math]::Floor($frame.foot[0] + (($x + 0.5) - 32) / $frame.scale)
                    $sy = [int][Math]::Floor($frame.foot[1] + (($y + 0.5) - 56) / $frame.scale)
                    if ($sx -ge $frame.box[0] -and $sx -lt $frame.box[2] -and $sy -ge $frame.box[1] -and $sy -lt $frame.box[3]) {
                        $sample = $images[$frame.source].GetPixel($sx, $sy)
                        $threshold = if ($frame.source -eq 'stand-approved.png') {128} else {$manifest.alphaThreshold}
                        if ($sample.A -ge $threshold) { $color = [Drawing.Color]::FromArgb(255, $sample.R, $sample.G, $sample.B) }
                    }
                }
                # Hand-checked negative-space mask, after source sampling and before mirroring.
                # Never erase a coloured body/weapon pixel if the source is changed later.
                foreach ($run in $frame.clearRuns) {
                    if ($y -eq $run[0] -and $x -ge $run[1] -and $x -le $run[2]) {
                        if ($color.A -gt 0 -and [Math]::Max($color.R, [Math]::Max($color.G, $color.B)) -ge 65) {
                            throw "Alpha repair overlaps artwork: $($frame.name) at $x,$y"
                        }
                        $color = [Drawing.Color]::Transparent
                    }
                }
                if ($color.A -gt 0) {
                    $atlas.SetPixel($column*64+$x, $row*64+$y, $color)
                    $minX=[Math]::Min($minX,$x); $minY=[Math]::Min($minY,$y)
                    $maxX=[Math]::Max($maxX,$x); $maxY=[Math]::Max($maxY,$y); $count++
                }
            }
        }
        if ($count -eq 0 -or $minX -le 0 -or $minY -le 0 -or $maxX -ge 63 -or $maxY -ge 63) {throw "Empty or clipped frame: $($frame.name)"}
        $report += [pscustomobject]@{id=$frame.id;name=$frame.name;bounds=@($minX,$minY,($maxX+1),($maxY+1));opaquePixels=$count}
    }
    $atlas.Save((Join-Path $PSScriptRoot 'ilyra-atlas.png'), [Drawing.Imaging.ImageFormat]::Png)
    $json = $report | ConvertTo-Json -Depth 5
    [IO.File]::WriteAllText((Join-Path $PSScriptRoot 'bounds.json'), ($json -replace "`r`n", "`n") + "`n", [Text.UTF8Encoding]::new($false))
    Write-Output "Packed $($report.Count) frames at 64x64; no empty or clipped frame."
} finally {
    $atlas.Dispose()
    foreach ($item in $images.Values) {$item.Dispose()}
}
