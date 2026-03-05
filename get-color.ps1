Add-Type -AssemblyName System.Drawing
try {
    $img = new-object System.Drawing.Bitmap "c:\Projetos\ecommerce\public\logo.png"
    $pixel = $img.GetPixel(0,0)
    Write-Host ("RGB: {0},{1},{2}" -f $pixel.R, $pixel.G, $pixel.B)
    $hex = "#{0:X2}{1:X2}{2:X2}" -f $pixel.R, $pixel.G, $pixel.B
    Write-Host ("HEX: " + $hex)
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}
