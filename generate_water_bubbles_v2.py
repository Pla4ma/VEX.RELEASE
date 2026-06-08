from PIL import Image, ImageDraw, ImageFilter
import math
import random

def create_realistic_water_bubble(size=512, filename='water_bubble_v2.png'):
    """Create a highly realistic water/glass bubble with advanced refraction."""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    pixels = img.load()
    
    center = size // 2
    radius = size // 2 - 20
    
    # Pre-compute caustic noise
    random.seed(42)
    caustics = []
    for _ in range(20):
        cx = random.randint(center - radius//2, center + radius//2)
        cy = random.randint(center - radius//2, center + radius//2)
        cr = random.randint(10, 40)
        intensity = random.uniform(0.3, 1.0)
        caustics.append((cx, cy, cr, intensity))
    
    for y in range(size):
        for x in range(size):
            dx = x - center
            dy = y - center
            dist = math.sqrt(dx * dx + dy * dy)
            
            if dist <= radius:
                nd = dist / radius  # 0 at center, 1 at edge
                
                # Refraction distortion
                refract_x = dx * (1.0 + 0.1 * math.sin(dy * 0.1))
                refract_y = dy * (1.0 + 0.1 * math.cos(dx * 0.1))
                
                # Base water color - very light mint with high transparency
                base_alpha = int(200 * (1 - nd * 0.4))
                
                # Caustic light patterns (bright spots where light focuses)
                caustic_intensity = 0
                for cx, cy, cr, intensity in caustics:
                    cd = math.sqrt((x - cx) ** 2 + (y - cy) ** 2)
                    if cd < cr:
                        caustic_intensity += intensity * (1 - cd / cr) ** 2
                caustic_intensity = min(1.0, caustic_intensity)
                
                # Fresnel effect - brighter at edges
                fresnel = nd ** 3
                
                # Specular highlight (top-left, sharp)
                spec_x = center - radius * 0.35
                spec_y = center - radius * 0.35
                spec_dist = math.sqrt((x - spec_x) ** 2 + (y - spec_y) ** 2)
                specular = max(0, 1 - spec_dist / (radius * 0.18))
                specular = specular ** 4
                
                # Secondary specular (bottom-right, soft and warm)
                spec2_x = center + radius * 0.45
                spec2_y = center + radius * 0.45
                spec2_dist = math.sqrt((x - spec2_x) ** 2 + (y - spec2_y) ** 2)
                specular2 = max(0, 1 - spec2_dist / (radius * 0.35)) * 0.4
                
                # Internal reflection ring (bright band inside edge)
                reflection_ring = 1.0 if 0.75 < nd < 0.92 else 0.0
                
                # Color composition
                # Mint/cyan base
                r = 185 + int(70 * caustic_intensity) + int(60 * fresnel)
                g = 235 + int(20 * caustic_intensity) + int(15 * fresnel)
                b = 225 + int(30 * caustic_intensity) + int(25 * fresnel)
                
                # Add specular highlights (white)
                r = min(255, int(r + 255 * specular))
                g = min(255, int(g + 255 * specular))
                b = min(255, int(b + 255 * specular))
                
                r = min(255, int(r + 200 * specular2))
                g = min(255, int(g + 200 * specular2))
                b = min(255, int(b + 200 * specular2))
                
                # Add reflection ring
                r = min(255, int(r + 100 * reflection_ring))
                g = min(255, int(g + 100 * reflection_ring))
                b = min(255, int(b + 100 * reflection_ring))
                
                # Edge darkening (thick glass edge)
                if nd > 0.92:
                    edge_dark = (nd - 0.92) / 0.08
                    r = int(r * (1 - edge_dark * 0.2))
                    g = int(g * (1 - edge_dark * 0.2))
                    b = int(b * (1 - edge_dark * 0.2))
                    base_alpha = int(base_alpha + 30 * edge_dark)
                
                pixels[x, y] = (r, g, b, base_alpha)
    
    # Add sharp outer rim highlight
    rim = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    rim_draw = ImageDraw.Draw(rim)
    for i in range(8):
        offset = i * 1.5
        alpha = max(0, 100 - i * 12)
        rim_draw.ellipse(
            [center - radius - offset, center - radius - offset,
             center + radius + offset, center + radius + offset],
            outline=(255, 255, 255, alpha)
        )
    
    img = Image.alpha_composite(img, rim)
    
    # Apply very slight blur for glass softness
    img = img.filter(ImageFilter.GaussianBlur(radius=0.5))
    
    img.save(filename, 'PNG')
    print(f"Created {filename}")

def create_water_caustics_background(size=1024, filename='water_caustics_bg.png'):
    """Create a water caustics background texture."""
    img = Image.new('RGBA', (size, size), (240, 250, 248, 255))
    pixels = img.load()
    
    # Generate caustic pattern
    for y in range(size):
        for x in range(size):
            # Multiple sine waves for caustic effect
            v1 = math.sin(x * 0.03) * math.cos(y * 0.02)
            v2 = math.sin((x + y) * 0.015) * math.cos((x - y) * 0.025)
            v3 = math.sin(x * 0.01 + y * 0.015) * 0.5
            
            caustic = (v1 + v2 + v3) / 3.0
            caustic = (caustic + 1) / 2.0  # Normalize to 0-1
            
            # Very subtle - only slight variations
            intensity = int(caustic * 15)  # Very subtle
            
            r = 240 + intensity
            g = 250 + int(intensity * 0.8)
            b = 248 + int(intensity * 0.9)
            
            pixels[x, y] = (r, g, b, 255)
    
    # Add larger light spots (caustics)
    draw = ImageDraw.Draw(img)
    random.seed(123)
    for _ in range(30):
        cx = random.randint(0, size)
        cy = random.randint(0, size)
        cr = random.randint(30, 120)
        
        for r in range(cr, 0, -2):
            alpha = int(30 * (1 - r / cr))
            draw.ellipse([cx - r, cy - r, cx + r, cy + r], 
                        fill=(255, 255, 255, alpha))
    
    img = img.filter(ImageFilter.GaussianBlur(radius=20))
    img.save(filename, 'PNG')
    print(f"Created {filename}")

def create_water_ripple(size=512, filename='water_ripple.png'):
    """Create a water ripple effect for backgrounds."""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    pixels = img.load()
    
    center = size // 2
    
    for y in range(size):
        for x in range(size):
            dx = x - center
            dy = y - center
            dist = math.sqrt(dx * dx + dy * dy)
            
            # Ripple pattern
            ripple = math.sin(dist * 0.1) * math.cos(dist * 0.08)
            ripple = (ripple + 1) / 2.0
            
            # Only show ripples in a ring pattern
            ring = math.exp(-((dist - size * 0.3) ** 2) / (size * 0.15) ** 2)
            
            alpha = int(80 * ripple * ring)
            
            if alpha > 5:
                r = 200 + int(55 * ripple)
                g = 240 + int(15 * ripple)
                b = 230 + int(25 * ripple)
                pixels[x, y] = (r, g, b, alpha)
    
    img = img.filter(ImageFilter.GaussianBlur(radius=8))
    img.save(filename, 'PNG')
    print(f"Created {filename}")

# Generate all water assets
print("Generating realistic water assets...")
create_realistic_water_bubble(512, 'assets/water/water_bubble_v2.png')
create_water_caustics_background(1024, 'assets/water/water_caustics_bg.png')
create_water_ripple(512, 'assets/water/water_ripple.png')

print("All water assets generated!")
