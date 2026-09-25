import os
from PIL import Image, ImageDraw, ImageFilter
import numpy as np

def generate_curved_square_favicons():
    # Source high-resolution master
    orig_path = 'assets/.originals/navigo-logo.png'
    if not os.path.exists(orig_path):
        orig_path = 'assets/navigo-logo.png'
    
    orig = Image.open(orig_path).convert('RGBA')
    w, h = orig.size
    arr_orig = np.array(orig)
    
    # Target background color of Navigo
    # Median background: RGB(57, 181, 255) -> #39B5FF
    bg_mask = (arr_orig[:, :, 3] == 255) & (arr_orig[:, :, 0] > 40) & (arr_orig[:, :, 0] < 80) & (arr_orig[:, :, 1] > 160) & (arr_orig[:, :, 1] < 200) & (arr_orig[:, :, 2] > 240)
    exact_bg = np.median(arr_orig[bg_mask][:, :3], axis=0).astype(int)
    print(f"Detected Navigo brand background color: RGB({exact_bg[0]}, {exact_bg[1]}, {exact_bg[2]})")
    
    # Center & distance map
    cx, cy = (w - 1) / 2.0, (h - 1) / 2.0
    ys, xs = np.indices((h, w))
    dist = np.sqrt((xs - cx)**2 + (ys - cy)**2)
    
    # Base canvas filled with the signature Navigo brand sky blue
    canvas = np.zeros((h, w, 4), dtype=np.uint8)
    canvas[:, :, 0] = exact_bg[0]
    canvas[:, :, 1] = exact_bg[1]
    canvas[:, :, 2] = exact_bg[2]
    canvas[:, :, 3] = 255
    
    # Identify content pixels (origami flight trail and black logo elements)
    is_white_trail = (arr_orig[:, :, 0] > 180) & (arr_orig[:, :, 1] > 180) & (arr_orig[:, :, 2] > 180) & (arr_orig[:, :, 3] > 50)
    is_dark_mark = (arr_orig[:, :, 0] < 80) & (arr_orig[:, :, 1] < 80) & (arr_orig[:, :, 2] < 80) & (arr_orig[:, :, 3] > 50)
    is_logo_content = is_white_trail | is_dark_mark
    
    # Retain all original crisp pixels inside radius 580
    inner_mask = dist < 580
    canvas[inner_mask] = arr_orig[inner_mask]
    
    # In transition zone (580 to 602), preserve logo content
    transition_mask = (dist >= 580) & (dist <= 602)
    content_trans = transition_mask & is_logo_content
    canvas[content_trans] = arr_orig[content_trans]
    
    # Apply high-precision 4x supersampled curved square (squircle) mask
    ss = 4
    mask_hi = Image.new('L', (w * ss, h * ss), 0)
    draw_hi = ImageDraw.Draw(mask_hi)
    radius_ss = int(w * ss * 0.225) # Standard modern curved square radius (~22.5%)
    draw_hi.rounded_rectangle([0, 0, w * ss - 1, h * ss - 1], radius=radius_ss, fill=255)
    mask = mask_hi.resize((w, h), Image.Resampling.LANCZOS)
    
    canvas[:, :, 3] = np.array(mask)
    master_curved_square = Image.fromarray(canvas)
    
    # Output assets
    os.makedirs('assets', exist_ok=True)
    
    # 1. Master 512x512
    img_512 = master_curved_square.resize((512, 512), Image.Resampling.LANCZOS)
    img_512.save('assets/favicon-curved-square.png', optimize=True)
    print("Saved assets/favicon-curved-square.png (512x512)")
    
    # Also update png_new_logo.png (which had been used for icons/favicons across the site)
    img_512.save('assets/png_new_logo.png', optimize=True)
    print("Updated assets/png_new_logo.png (512x512 curved square)")
    
    # 2. 192x192 for Android / PWA
    img_192 = master_curved_square.resize((192, 192), Image.Resampling.LANCZOS)
    img_192.save('assets/favicon-curved-square-192.png', optimize=True)
    print("Saved assets/favicon-curved-square-192.png (192x192)")
    
    # 3. 180x180 for Apple Touch Icon
    img_180 = master_curved_square.resize((180, 180), Image.Resampling.LANCZOS)
    img_180.save('assets/apple-touch-icon.png', optimize=True)
    print("Saved assets/apple-touch-icon.png (180x180)")
    
    # 4. 48x48
    img_48 = master_curved_square.resize((48, 48), Image.Resampling.LANCZOS)
    img_48.save('assets/favicon-48x48.png', optimize=True)
    print("Saved assets/favicon-48x48.png (48x48)")
    
    # 5. 32x32 with subtle sharpening for crisp desktop browser tabs
    img_32 = master_curved_square.resize((32, 32), Image.Resampling.LANCZOS)
    img_32_sharp = img_32.filter(ImageFilter.UnsharpMask(radius=1.0, percent=125, threshold=3))
    img_32_sharp.save('assets/favicon-32x32.png', optimize=True)
    print("Saved assets/favicon-32x32.png (32x32, sharpened)")
    
    # 6. 16x16 with subtle sharpening for compact browser tabs
    img_16 = master_curved_square.resize((16, 16), Image.Resampling.LANCZOS)
    img_16_sharp = img_16.filter(ImageFilter.UnsharpMask(radius=0.8, percent=130, threshold=3))
    img_16_sharp.save('assets/favicon-16x16.png', optimize=True)
    print("Saved assets/favicon-16x16.png (16x16, sharpened)")
    
    # 7. Root multi-resolution favicon.ico
    # Combining 16, 32, 48, 64, 128, 256 for universal compatibility
    ico_sizes = [(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
    master_curved_square.save('favicon.ico', sizes=ico_sizes)
    print("Saved root favicon.ico (multi-resolution: 16, 32, 48, 64, 128, 256)")

if __name__ == '__main__':
    generate_curved_square_favicons()
