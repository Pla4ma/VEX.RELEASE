from PIL import Image, ImageDraw, ImageFilter
import math
import random

def create_soft_water_bubble(size=512, filename='water_bubble_soft.png'):
    """Create a very soft, luminous water bubble matching reference exactly."""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    pixels = img.load()
    
    center = size // 2
    radius = size // 2 - 15
    
    # Soft caustic spots
    caustics = []
    random.seed(42)
    for _ in range(12):
        angle = random.random() * 2 * math.pi
        dist = random.random() * radius * 0.6
        cx = center + dist * math.cos(angle)
        cy = center + dist * math.sin(angle)
        cr = random.randint(20, 50)
        intensity = random.uniform(0.15, 0.35)
        caustics.append((cx, cy, cr, intensity))
    
    for y in range(size):
        for x in range(size):
            dx = x - center
            dy = y - center
            dist = math.sqrt(dx * dx + dy * dy)
            
            if dist <= radius:
                nd = dist / radius  # 0 center, 1 edge
                
                # Very soft base - light mint center fading to transparent
                # Using exponential falloff for soft glow
                base_alpha = int(200 * math.exp(-nd * 2.5))
                
                # Subtle caustic highlights
                caustic_intensity = 0
                for cx, cy, cr, intensity in caustics:
                    cd = math.sqrt((x - cx) ** 2 + (y - cy) ** 2)
                    if cd < cr:
                        caustic_intensity += intensity * (1 - cd / cr) ** 3
                caustic_intensity = min(0.4, caustic_intensity)
                
                # Specular highlight (top-left, very soft)
                spec_x = center - radius * 0.25
                spec_y = center - radius * 0.25
                spec_dist = math.sqrt((x - spec_x) ** 2 + (y - spec_y) ** 2)
                specular = max(0, 1 - spec_dist / (radius * 0.3))
                specular = specular ** 3
                
                # Soft inner reflection ring (very subtle)
                reflection = 0.15 if 0.7 < nd < 0.9 else 0.0
                
                # Very soft color - mostly white with slight teal tint
                # Base: very light mint/white
                r = 220 + int(35 * caustic_intensity) + int(35 * specular) + int(20 * reflection)
                g = 245 + int(10 * caustic_intensity) + int(35 * specular) + int(20 * reflection)
                b = 235 + int(20 * caustic_intensity) + int(35 * specular) + int(20 * reflection)
                
                # Edge darkening (very subtle for glass thickness)
                if nd > 0.85:
                    edge_factor = (nd - 0.85) / 0.15
                    r = int(r * (1 - edge_factor * 0.15))
                    g = int(g * (1 - edge_factor * 0.15))
                    b = int(b * (1 - edge_factor * 0.15))
                    base_alpha = int(base_alpha + 15 * edge_factor)
                
                pixels[x, y] = (r, g, b, base_alpha)
    
    # Very heavy blur for ethereal soft look
    img = img.filter(ImageFilter.GaussianBlur(radius=3))
    
    # Add soft outer glow ring
    glow = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    for i in range(6):
        offset = i * 2.5
        alpha = max(0, 40 - i * 6)
        glow_draw.ellipse(
            [center - radius - offset, center - radius - offset,
             center + radius + offset, center + radius + offset],
            outline=(180, 235, 225, alpha)
        )
    
    glow = glow.filter(ImageFilter.GaussianBlur(radius=4))
    img = Image.alpha_composite(img, glow)
    
    img.save(filename, 'PNG')
    print(f"Created {filename}")

def create_water_bubble_large(size=600, filename='water_bubble_large.png'):
    """Create a large prominent water bubble for hero cards."""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    pixels = img.load()
    
    center = size // 2
    radius = size // 2 - 20
    
    # Soft caustic spots
    caustics = []
    random.seed(123)
    for _ in range(15):
        angle = random.random() * 2 * math.pi
        dist = random.random() * radius * 0.55
        cx = center + dist * math.cos(angle)
        cy = center + dist * math.sin(angle)
        cr = random.randint(30, 70)
        intensity = random.uniform(0.12, 0.3)
        caustics.append((cx, cy, cr, intensity))
    
    for y in range(size):
        for x in range(size):
            dx = x - center
            dy = y - center
            dist = math.sqrt(dx * dx + dy * dy)
            
            if dist <= radius:
                nd = dist / radius
                
                base_alpha = int(220 * math.exp(-nd * 2.8))
                
                caustic_intensity = 0
                for cx, cy, cr, intensity in caustics:
                    cd = math.sqrt((x - cx) ** 2 + (y - cy) ** 2)
                    if cd < cr:
                        caustic_intensity += intensity * (1 - cd / cr) ** 3
                caustic_intensity = min(0.35, caustic_intensity)
                
                spec_x = center - radius * 0.22
                spec_y = center - radius * 0.22
                spec_dist = math.sqrt((x - spec_x) ** 2 + (y - spec_y) ** 2)
                specular = max(0, 1 - spec_dist / (radius * 0.35))
                specular = specular ** 4
                
                r = 225 + int(30 * caustic_intensity) + int(30 * specular)
                g = 248 + int(7 * caustic_intensity) + int(30 * specular)
                b = 240 + int(15 * caustic_intensity) + int(30 * specular)
                
                if nd > 0.88:
                    edge_factor = (nd - 0.88) / 0.12
                    r = int(r * (1 - edge_factor * 0.12))
                    g = int(g * (1 - edge_factor * 0.12))
                    b = int(b * (1 - edge_factor * 0.12))
                    base_alpha = int(base_alpha + 20 * edge_factor)
                
                pixels[x, y] = (r, g, b, base_alpha)
    
    img = img.filter(ImageFilter.GaussianBlur(radius=4))
    
    # Soft glow ring
    glow = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    for i in range(8):
        offset = i * 3
        alpha = max(0, 50 - i * 6)
        glow_draw.ellipse(
            [center - radius - offset, center - radius - offset,
             center + radius + offset, center + radius + offset],
            outline=(185, 240, 230, alpha)
        )
    
    glow = glow.filter(ImageFilter.GaussianBlur(radius=5))
    img = Image.alpha_composite(img, glow)
    
    img.save(filename, 'PNG')
    print(f"Created {filename}")

def create_small_water_bubble(size=200, filename='water_bubble_small.png'):
    """Create small decorative water bubble."""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    pixels = img.load()
    
    center = size // 2
    radius = size // 2 - 8
    
    for y in range(size):
        for x in range(size):
            dx = x - center
            dy = y - center
            dist = math.sqrt(dx * dx + dy * dy)
            
            if dist <= radius:
                nd = dist / radius
                
                base_alpha = int(180 * math.exp(-nd * 3.0))
                
                # Very subtle caustic
                caustic = math.sin(dx * 0.1) * math.cos(dy * 0.1) * 0.1 + 0.1
                
                spec_x = center - radius * 0.2
                spec_y = center - radius * 0.2
                spec_dist = math.sqrt((x - spec_x) ** 2 + (y - spec_y) ** 2)
                specular = max(0, 1 - spec_dist / (radius * 0.3))
                specular = specular ** 3
                
                r = 230 + int(25 * caustic) + int(25 * specular)
                g = 248 + int(7 * caustic) + int(25 * specular)
                b = 242 + int(15 * caustic) + int(25 * specular)
                
                pixels[x, y] = (r, g, b, base_alpha)
    
    img = img.filter(ImageFilter.GaussianBlur(radius=2))
    img.save(filename, 'PNG')
    print(f"Created {filename}")

def create_water_ripple_bg(size=1024, filename='water_ripple_bg.png'):
    """Create very subtle water ripple background."""
    img = Image.new('RGBA', (size, size), (245, 252, 249, 255))
    pixels = img.load()
    
    # Very subtle caustic pattern
    for y in range(size):
        for x in range(size):
            v1 = math.sin(x * 0.02) * math.cos(y * 0.015) * 0.5
            v2 = math.sin((x + y) * 0.01) * math.cos((x - y) * 0.02) * 0.3
            v3 = math.sin(x * 0.008 + y * 0.012) * 0.2
            
            caustic = (v1 + v2 + v3) / 1.0
            caustic = (caustic + 1) / 2.0
            
            # Very subtle - barely visible
            intensity = int(caustic * 8)
            
            r = 245 + intensity
            g = 252 + int(intensity * 0.8)
            b = 249 + int(intensity * 0.9)
            
            pixels[x, y] = (r, g, b, 255)
    
    # Add larger soft light spots
    draw = ImageDraw.Draw(img)
    random.seed(456)
    for _ in range(40):
        cx = random.randint(0, size)
        cy = random.randint(0, size)
        cr = random.randint(40, 150)
        
        for r in range(cr, 0, -3):
            alpha = int(20 * (1 - r / cr))
            draw.ellipse([cx - r, cy - r, cx + r, cy + r], 
                        fill=(255, 255, 255, alpha))
    
    img = img.filter(ImageFilter.GaussianBlur(radius=25))
    img.save(filename, 'PNG')
    print(f"Created {filename}")

print("Generating soft ethereal water bubbles...")
create_soft_water_bubble(512, 'assets/water/water_bubble_soft.png')
create_water_bubble_large(600, 'assets/water/water_bubble_large.png')
create_small_water_bubble(200, 'assets/water/water_bubble_small.png')
create_water_ripple_bg(1024, 'assets/water/water_ripple_bg.png')
print("All soft water bubbles generated!")
