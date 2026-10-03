import os
import math

SVG_DIR = r"C:\4to ciclo\fnempre\frontend\public\images\relojes"
os.makedirs(SVG_DIR, exist_ok=True)

def generate_all():
    # 0. Master Placeholder
    placeholder_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <defs>
    <radialGradient id="pGlow" cx="50%" cy="50%" r="55%">
      <stop offset="0%" stop-color="#1B1D22" />
      <stop offset="100%" stop-color="#111214" />
    </radialGradient>
    <linearGradient id="pGold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#C5A880" stop-opacity="0.7" />
      <stop offset="100%" stop-color="#A58A68" stop-opacity="0.2" />
    </linearGradient>
  </defs>
  <rect width="500" height="500" fill="url(#pGlow)" />
  <rect x="12" y="12" width="476" height="476" fill="none" stroke="#25272D" stroke-width="1" />
  <rect x="24" y="24" width="452" height="452" fill="none" stroke="#1C1E23" stroke-width="1" stroke-dasharray="4 4" />
  <circle cx="250" cy="235" r="135" fill="none" stroke="#2B2E35" stroke-width="1.5" />
  <circle cx="250" cy="235" r="110" fill="none" stroke="url(#pGold)" stroke-width="1" stroke-dasharray="3 4" />
  <circle cx="250" cy="235" r="75" fill="none" stroke="#2B2E35" stroke-width="1" />
  <line x1="250" y1="80" x2="250" y2="390" stroke="#23252C" stroke-width="1" stroke-dasharray="3 3" />
  <line x1="95" y1="235" x2="405" y2="235" stroke="#23252C" stroke-width="1" stroke-dasharray="3 3" />
  <line x1="250" y1="235" x2="250" y2="145" stroke="#C5A880" stroke-width="2" stroke-linecap="round" />
  <line x1="250" y1="235" x2="315" y2="195" stroke="#C5A880" stroke-width="2" stroke-linecap="round" />
  <circle cx="250" cy="235" r="3.5" fill="#C5A880" />
  <path d="M 185 110 L 195 90 L 305 90 L 315 110" fill="none" stroke="#2B2E35" stroke-width="1.5" />
  <path d="M 185 360 L 195 380 L 305 380 L 315 360" fill="none" stroke="#2B2E35" stroke-width="1.5" />
  <text x="250" y="415" font-family="monospace" font-size="9" letter-spacing="4" fill="#C5A880" text-anchor="middle">CRONOS GENÈVE · ARCHIVO TÉCNICO</text>
  <text x="250" y="435" font-family="serif" font-size="14" letter-spacing="2" fill="#ECEAE5" text-anchor="middle">PIEZA EN CATALOGACIÓN</text>
  <text x="250" y="455" font-family="monospace" font-size="8" letter-spacing="3" fill="#6B6D74" text-anchor="middle">FICHA Y REGISTRO EN BÓVEDA</text>
</svg>"""
    with open(os.path.join(SVG_DIR, "placeholder-reloj.svg"), "w", encoding="utf-8") as f:
        f.write(placeholder_svg)

    # Helper function
    def wrap_watch(filename, dial_markup, brand, model, strap="steel", case="round", case_color="#C2C5CD", bezel_color="#181A1D"):
        # Strap
        if strap == "steel":
            strap_code = """
            <rect x="182" y="25" width="136" height="115" fill="#292B30" stroke="#3D4046" stroke-width="1.5" />
            <line x1="182" y1="52" x2="318" y2="52" stroke="#18191C" stroke-width="2" />
            <line x1="182" y1="80" x2="318" y2="80" stroke="#18191C" stroke-width="2" />
            <line x1="182" y1="108" x2="318" y2="108" stroke="#18191C" stroke-width="2" />
            <rect x="220" y="25" width="60" height="115" fill="#35383E" stroke="#484C54" stroke-width="1" />
            <rect x="182" y="360" width="136" height="115" fill="#292B30" stroke="#3D4046" stroke-width="1.5" />
            <line x1="182" y1="388" x2="318" y2="388" stroke="#18191C" stroke-width="2" />
            <line x1="182" y1="416" x2="318" y2="416" stroke="#18191C" stroke-width="2" />
            <line x1="182" y1="444" x2="318" y2="444" stroke="#18191C" stroke-width="2" />
            <rect x="220" y="360" width="60" height="115" fill="#35383E" stroke="#484C54" stroke-width="1" />
            """
        elif strap == "jubilee":
            strap_code = """
            <rect x="182" y="25" width="136" height="115" fill="#292B30" stroke="#3D4046" stroke-width="1.5" />
            <line x1="182" y1="48" x2="318" y2="48" stroke="#18191C" stroke-width="1.5" />
            <line x1="182" y1="70" x2="318" y2="70" stroke="#18191C" stroke-width="1.5" />
            <line x1="182" y1="92" x2="318" y2="92" stroke="#18191C" stroke-width="1.5" />
            <line x1="182" y1="114" x2="318" y2="114" stroke="#18191C" stroke-width="1.5" />
            <rect x="208" y="25" width="28" height="115" fill="#3D4046" />
            <rect x="236" y="25" width="28" height="115" fill="#4B4F57" />
            <rect x="264" y="25" width="28" height="115" fill="#3D4046" />
            <rect x="182" y="360" width="136" height="115" fill="#292B30" stroke="#3D4046" stroke-width="1.5" />
            <line x1="182" y1="382" x2="318" y2="382" stroke="#18191C" stroke-width="1.5" />
            <line x1="182" y1="404" x2="318" y2="404" stroke="#18191C" stroke-width="1.5" />
            <line x1="182" y1="426" x2="318" y2="426" stroke="#18191C" stroke-width="1.5" />
            <line x1="182" y1="448" x2="318" y2="448" stroke="#18191C" stroke-width="1.5" />
            <rect x="208" y="360" width="28" height="115" fill="#3D4046" />
            <rect x="236" y="360" width="28" height="115" fill="#4B4F57" />
            <rect x="264" y="360" width="28" height="115" fill="#3D4046" />
            """
        elif strap == "leather_black":
            strap_code = """
            <rect x="186" y="25" width="128" height="115" fill="#18191B" stroke="#26272C" stroke-width="1.5" rx="4" />
            <line x1="193" y1="25" x2="193" y2="140" stroke="#303238" stroke-width="1.5" stroke-dasharray="3 3" />
            <line x1="307" y1="25" x2="307" y2="140" stroke="#303238" stroke-width="1.5" stroke-dasharray="3 3" />
            <rect x="186" y="360" width="128" height="115" fill="#18191B" stroke="#26272C" stroke-width="1.5" rx="4" />
            <line x1="193" y1="360" x2="193" y2="475" stroke="#303238" stroke-width="1.5" stroke-dasharray="3 3" />
            <line x1="307" y1="360" x2="307" y2="475" stroke="#303238" stroke-width="1.5" stroke-dasharray="3 3" />
            """
        elif strap == "leather_brown":
            strap_code = """
            <rect x="186" y="25" width="128" height="115" fill="#2E1F18" stroke="#3D2920" stroke-width="1.5" rx="4" />
            <line x1="193" y1="25" x2="193" y2="140" stroke="#4A3429" stroke-width="1.5" stroke-dasharray="3 3" />
            <line x1="307" y1="25" x2="307" y2="140" stroke="#4A3429" stroke-width="1.5" stroke-dasharray="3 3" />
            <rect x="186" y="360" width="128" height="115" fill="#2E1F18" stroke="#3D2920" stroke-width="1.5" rx="4" />
            <line x1="193" y1="360" x2="193" y2="475" stroke="#4A3429" stroke-width="1.5" stroke-dasharray="3 3" />
            <line x1="307" y1="360" x2="307" y2="475" stroke="#4A3429" stroke-width="1.5" stroke-dasharray="3 3" />
            """
        elif strap == "rubber_blue":
            strap_code = """
            <rect x="186" y="25" width="128" height="115" fill="#141E2E" stroke="#1E2A40" stroke-width="1.5" rx="3" />
            <line x1="186" y1="60" x2="314" y2="60" stroke="#0E1622" stroke-width="3" />
            <line x1="186" y1="90" x2="314" y2="90" stroke="#0E1622" stroke-width="3" />
            <rect x="186" y="360" width="128" height="115" fill="#141E2E" stroke="#1E2A40" stroke-width="1.5" rx="3" />
            <line x1="186" y1="395" x2="314" y2="395" stroke="#0E1622" stroke-width="3" />
            <line x1="186" y1="425" x2="314" y2="425" stroke="#0E1622" stroke-width="3" />
            """
        elif strap == "rubber_black":
            strap_code = """
            <rect x="186" y="25" width="128" height="115" fill="#191B1F" stroke="#292C32" stroke-width="1.5" rx="3" />
            <line x1="186" y1="60" x2="314" y2="60" stroke="#101114" stroke-width="3" />
            <line x1="186" y1="90" x2="314" y2="90" stroke="#101114" stroke-width="3" />
            <rect x="186" y="360" width="128" height="115" fill="#191B1F" stroke="#292C32" stroke-width="1.5" rx="3" />
            <line x1="186" y1="395" x2="314" y2="395" stroke="#101114" stroke-width="3" />
            <line x1="186" y1="425" x2="314" y2="425" stroke="#101114" stroke-width="3" />
            """
        elif strap == "leather_blue":
            strap_code = """
            <rect x="186" y="25" width="128" height="115" fill="#182333" stroke="#26344A" stroke-width="1.5" rx="4" />
            <line x1="193" y1="25" x2="193" y2="140" stroke="#2C3D57" stroke-width="1.5" stroke-dasharray="3 3" />
            <line x1="307" y1="25" x2="307" y2="140" stroke="#2C3D57" stroke-width="1.5" stroke-dasharray="3 3" />
            <rect x="186" y="360" width="128" height="115" fill="#182333" stroke="#26344A" stroke-width="1.5" rx="4" />
            <line x1="193" y1="360" x2="193" y2="475" stroke="#2C3D57" stroke-width="1.5" stroke-dasharray="3 3" />
            <line x1="307" y1="360" x2="307" y2="475" stroke="#2C3D57" stroke-width="1.5" stroke-dasharray="3 3" />
            """

        # Case
        if case == "round":
            case_code = f"""
            <rect x="382" y="235" width="18" height="30" fill="{case_color}" rx="2" stroke="#1E2024" stroke-width="1" />
            <path d="M 180 140 L 165 170 L 165 330 L 180 360 L 320 360 L 335 330 L 335 170 L 320 140 Z" fill="{case_color}" opacity="0.9" />
            <circle cx="250" cy="250" r="142" fill="{case_color}" stroke="#16181B" stroke-width="2" />
            <circle cx="250" cy="250" r="132" fill="{bezel_color}" stroke="#2A2C30" stroke-width="3" />
            """
        elif case == "square":
            case_code = f"""
            <rect x="375" y="238" width="16" height="24" fill="{case_color}" rx="2" stroke="#1E2024" />
            <rect x="125" y="125" width="250" height="250" rx="20" fill="{case_color}" stroke="#1E2024" stroke-width="2" />
            <rect x="140" y="140" width="220" height="220" rx="14" fill="{bezel_color}" stroke="#333" stroke-width="2" />
            """
        elif case == "octagonal":
            pts = []
            for i in range(8):
                angle = math.radians(i * 45 + 22.5)
                x = 250 + 138 * math.cos(angle)
                y = 250 + 138 * math.sin(angle)
                pts.append(f"{x:.1f},{y:.1f}")
            poly_pts = " ".join(pts)
            pts_in = []
            for i in range(8):
                angle = math.radians(i * 45 + 22.5)
                x = 250 + 128 * math.cos(angle)
                y = 250 + 128 * math.sin(angle)
                pts_in.append(f"{x:.1f},{y:.1f}")
            poly_in = " ".join(pts_in)
            case_code = f"""
            <polygon points="380,242 392,246 392,254 380,258" fill="{case_color}" />
            <circle cx="250" cy="250" r="144" fill="{case_color}" />
            <polygon points="{poly_pts}" fill="{bezel_color}" stroke="#1F2124" stroke-width="3" />
            <polygon points="{poly_in}" fill="{case_color}" stroke="#161719" stroke-width="1.5" />
            """
        elif case == "nautilus":
            case_code = f"""
            <rect x="382" y="240" width="14" height="20" fill="{case_color}" rx="2" />
            <path d="M 108 230 C 108 215 130 205 140 205 L 360 205 C 370 205 392 215 392 230 L 392 270 C 392 285 370 295 360 295 L 140 295 C 130 295 108 285 108 270 Z" fill="{case_color}" stroke="#16171A" stroke-width="1.5" />
            <rect x="125" y="130" width="250" height="240" rx="60" fill="{case_color}" stroke="#16171A" stroke-width="2" />
            <rect x="138" y="142" width="224" height="216" rx="50" fill="{bezel_color}" stroke="#222" stroke-width="2" />
            """
        elif case == "tank":
            case_code = f"""
            <path d="M 366 242 L 378 245 C 382 248 382 252 378 255 L 366 258 Z" fill="#1C3879" stroke="#16181B" stroke-width="1" />
            <rect x="135" y="105" width="28" height="290" rx="6" fill="{case_color}" stroke="#16181B" stroke-width="1.5" />
            <rect x="337" y="105" width="28" height="290" rx="6" fill="{case_color}" stroke="#16181B" stroke-width="1.5" />
            <rect x="155" y="140" width="190" height="220" fill="{bezel_color}" stroke="#16181B" stroke-width="1.5" />
            """

        full_svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <defs>
    <radialGradient id="bgLight" cx="50%" cy="50%" r="55%">
      <stop offset="0%" stop-color="#1B1D22" />
      <stop offset="100%" stop-color="#111214" />
    </radialGradient>
  </defs>
  <rect width="500" height="500" fill="url(#bgLight)" />
  <rect x="8" y="8" width="484" height="484" fill="none" stroke="#212328" stroke-width="1" />
  {strap_code}
  {case_code}
  {dial_markup}
  <text x="250" y="482" font-family="'Cinzel', 'Playfair Display', serif" font-size="9" letter-spacing="3" fill="#6B6E76" text-anchor="middle" text-transform="uppercase">{brand} · {model}</text>
</svg>"""
        with open(os.path.join(SVG_DIR, filename), "w", encoding="utf-8") as f:
            f.write(full_svg)

    # 1. Rolex Submariner Kermit
    sub_kermit = """
    <!-- Green Cerachrom Bezel Markers -->
    <circle cx="250" cy="250" r="128" fill="#0A5C36" stroke="#063E24" stroke-width="2" />
    <polygon points="250,126 244,136 256,136" fill="#F0F0F0" />
    <circle cx="250" cy="133" r="3" fill="#A5C8E4" />
    <text x="360" y="254" font-family="sans-serif" font-size="10" font-weight="bold" fill="#F0F0F0" text-anchor="middle">15</text>
    <text x="250" y="366" font-family="sans-serif" font-size="10" font-weight="bold" fill="#F0F0F0" text-anchor="middle">30</text>
    <text x="140" y="254" font-family="sans-serif" font-size="10" font-weight="bold" fill="#F0F0F0" text-anchor="middle">45</text>
    <!-- Black Dial -->
    <circle cx="250" cy="250" r="102" fill="#0C0D10" stroke="#222" stroke-width="2" />
    <!-- Markers -->
    <polygon points="250,154 242,168 258,168" fill="#E8ECEF" stroke="#C0C2C8" stroke-width="1" />
    <rect x="246" y="328" width="8" height="16" fill="#E8ECEF" stroke="#C0C2C8" stroke-width="1" />
    <rect x="156" y="246" width="16" height="8" fill="#E8ECEF" stroke="#C0C2C8" stroke-width="1" />
    <!-- Date window at 3 -->
    <rect x="318" y="242" width="22" height="16" fill="#FFF" stroke="#A58A68" stroke-width="1" />
    <text x="329" y="254" font-family="sans-serif" font-size="11" font-weight="bold" fill="#000" text-anchor="middle">28</text>
    <!-- Circles for 1,2,4,5,7,8,10,11 -->
    <circle cx="300" cy="170" r="6" fill="#E8ECEF" stroke="#C0C2C8" />
    <circle cx="330" cy="205" r="6" fill="#E8ECEF" stroke="#C0C2C8" />
    <circle cx="330" cy="295" r="6" fill="#E8ECEF" stroke="#C0C2C8" />
    <circle cx="300" cy="330" r="6" fill="#E8ECEF" stroke="#C0C2C8" />
    <circle cx="200" cy="330" r="6" fill="#E8ECEF" stroke="#C0C2C8" />
    <circle cx="170" cy="295" r="6" fill="#E8ECEF" stroke="#C0C2C8" />
    <circle cx="170" cy="205" r="6" fill="#E8ECEF" stroke="#C0C2C8" />
    <circle cx="200" cy="170" r="6" fill="#E8ECEF" stroke="#C0C2C8" />
    <!-- Mercedes Hands -->
    <line x1="250" y1="250" x2="210" y2="210" stroke="#E8ECEF" stroke-width="5" stroke-linecap="round" />
    <circle cx="218" cy="218" r="7" fill="#0C0D10" stroke="#E8ECEF" stroke-width="2" />
    <line x1="250" y1="250" x2="250" y2="175" stroke="#E8ECEF" stroke-width="3" stroke-linecap="round" />
    <line x1="250" y1="250" x2="295" y2="300" stroke="#C5A880" stroke-width="1.5" />
    <circle cx="250" cy="250" r="5" fill="#E8ECEF" />
    """
    wrap_watch("rolex-submariner-kermit.svg", sub_kermit, "ROLEX", "SUBMARINER DATE 41MM", strap="steel", case="round", bezel_color="#0A5C36")

    # 2. Rolex Daytona Panda
    daytona_panda = """
    <!-- Ceramic Black Tachymeter Bezel -->
    <circle cx="250" cy="250" r="128" fill="#141518" stroke="#25272B" stroke-width="2" />
    <text x="250" y="132" font-family="monospace" font-size="8" fill="#AAA" text-anchor="middle">UNITS PER HOUR 400</text>
    <text x="360" y="200" font-family="monospace" font-size="8" fill="#AAA" text-anchor="middle">240</text>
    <text x="362" y="270" font-family="monospace" font-size="8" fill="#AAA" text-anchor="middle">160</text>
    <text x="250" y="372" font-family="monospace" font-size="8" fill="#AAA" text-anchor="middle">110</text>
    <text x="138" y="270" font-family="monospace" font-size="8" fill="#AAA" text-anchor="middle">80</text>
    <text x="140" y="200" font-family="monospace" font-size="8" fill="#AAA" text-anchor="middle">60</text>
    <!-- White Lacquer Dial -->
    <circle cx="250" cy="250" r="104" fill="#F4F4F6" stroke="#C5C7CC" stroke-width="1.5" />
    <!-- 3 Black Subdials -->
    <circle cx="205" cy="250" r="22" fill="#16171A" stroke="#C5C7CC" stroke-width="1.5" />
    <circle cx="295" cy="250" r="22" fill="#16171A" stroke="#C5C7CC" stroke-width="1.5" />
    <circle cx="250" cy="290" r="22" fill="#16171A" stroke="#C5C7CC" stroke-width="1.5" />
    <line x1="205" y1="250" x2="214" y2="242" stroke="#FFF" stroke-width="1.5" />
    <line x1="295" y1="250" x2="288" y2="245" stroke="#FFF" stroke-width="1.5" />
    <line x1="250" y1="290" x2="250" y2="278" stroke="#FFF" stroke-width="1.5" />
    <!-- Markers -->
    <rect x="247" y="152" width="6" height="12" fill="#16171A" />
    <!-- Red DAYTONA Text -->
    <text x="250" y="264" font-family="sans-serif" font-size="7" font-weight="bold" fill="#D32F2F" letter-spacing="1" text-anchor="middle">DAYTONA</text>
    <!-- Hands -->
    <line x1="250" y1="250" x2="220" y2="200" stroke="#16171A" stroke-width="3.5" stroke-linecap="round" />
    <line x1="250" y1="250" x2="280" y2="180" stroke="#16171A" stroke-width="2.5" stroke-linecap="round" />
    <line x1="250" y1="250" x2="250" y2="160" stroke="#D32F2F" stroke-width="1.5" />
    <circle cx="250" cy="250" r="4.5" fill="#16171A" />
    """
    wrap_watch("rolex-daytona-panda.svg", daytona_panda, "ROLEX", "COSMOGRAPH DAYTONA 'PANDA'", strap="steel", case="round", bezel_color="#141518")

    # 3. Rolex Datejust 41
    datejust_blue = """
    <!-- Fluted White Gold Bezel pattern -->
    <circle cx="250" cy="250" r="128" fill="#D6D9E0" stroke="#8A8E98" stroke-width="2" />
    <circle cx="250" cy="250" r="124" fill="#C0C4CC" stroke="#FFF" stroke-width="1" stroke-dasharray="3 3" />
    <!-- Sunray Blue Dial -->
    <circle cx="250" cy="250" r="106" fill="#152B4D" stroke="#0D1A30" stroke-width="2" />
    <!-- Applied Baton Markers with Lume -->
    <polygon points="250,152 245,160 255,160" fill="#E8ECEF" />
    <rect x="247" y="332" width="6" height="14" fill="#E8ECEF" stroke="#A8ADB8" stroke-width="1" />
    <rect x="156" y="247" width="14" height="6" fill="#E8ECEF" stroke="#A8ADB8" stroke-width="1" />
    <!-- Date window with Cyclops at 3 -->
    <rect x="322" y="241" width="22" height="18" fill="#FFF" stroke="#C5A880" stroke-width="1" />
    <text x="333" y="254" font-family="sans-serif" font-size="11" font-weight="bold" fill="#000" text-anchor="middle">28</text>
    <!-- Hour markers -->
    <circle cx="298" cy="174" r="4.5" fill="#E8ECEF" />
    <circle cx="328" cy="210" r="4.5" fill="#E8ECEF" />
    <circle cx="328" cy="290" r="4.5" fill="#E8ECEF" />
    <circle cx="298" cy="326" r="4.5" fill="#E8ECEF" />
    <circle cx="202" cy="326" r="4.5" fill="#E8ECEF" />
    <circle cx="172" cy="290" r="4.5" fill="#E8ECEF" />
    <circle cx="172" cy="210" r="4.5" fill="#E8ECEF" />
    <circle cx="202" cy="174" r="4.5" fill="#E8ECEF" />
    <!-- Classic Baton Hands -->
    <line x1="250" y1="250" x2="200" y2="225" stroke="#E8ECEF" stroke-width="4" stroke-linecap="round" />
    <line x1="250" y1="250" x2="250" y2="168" stroke="#E8ECEF" stroke-width="3" stroke-linecap="round" />
    <line x1="250" y1="250" x2="285" y2="305" stroke="#C0C4CC" stroke-width="1" />
    <circle cx="250" cy="250" r="4" fill="#E8ECEF" />
    """
    wrap_watch("rolex-datejust-41.svg", datejust_blue, "ROLEX", "DATEJUST 41 ESFERA AZUL", strap="jubilee", case="round", bezel_color="#D6D9E0")

    # 4. Rolex GMT-Master II Pepsi
    gmt_pepsi = """
    <!-- Two-tone Cerachrom Bezel: Top Blue, Bottom Red -->
    <path d="M 122 250 A 128 128 0 0 1 378 250 Z" fill="#0F2B59" />
    <path d="M 122 250 A 128 128 0 0 0 378 250 Z" fill="#8B1824" />
    <circle cx="250" cy="250" r="128" fill="none" stroke="#25272B" stroke-width="2" />
    <!-- Bezel 24hr Numerals -->
    <text x="250" y="134" font-family="sans-serif" font-size="11" font-weight="bold" fill="#FFF" text-anchor="middle">24</text>
    <text x="360" y="254" font-family="sans-serif" font-size="11" font-weight="bold" fill="#FFF" text-anchor="middle">6</text>
    <text x="250" y="370" font-family="sans-serif" font-size="11" font-weight="bold" fill="#FFF" text-anchor="middle">12</text>
    <text x="140" y="254" font-family="sans-serif" font-size="11" font-weight="bold" fill="#FFF" text-anchor="middle">18</text>
    <!-- Black Dial -->
    <circle cx="250" cy="250" r="102" fill="#0D0E12" stroke="#202227" stroke-width="2" />
    <!-- Markers -->
    <polygon points="250,154 242,168 258,168" fill="#E8ECEF" />
    <rect x="246" y="328" width="8" height="16" fill="#E8ECEF" />
    <rect x="156" y="246" width="16" height="8" fill="#E8ECEF" />
    <!-- Cyclops Date at 3 -->
    <rect x="318" y="242" width="22" height="16" fill="#FFF" />
    <text x="329" y="254" font-family="sans-serif" font-size="11" font-weight="bold" fill="#000" text-anchor="middle">14</text>
    <!-- Hour Dots -->
    <circle cx="300" cy="170" r="6" fill="#E8ECEF" />
    <circle cx="330" cy="205" r="6" fill="#E8ECEF" />
    <circle cx="330" cy="295" r="6" fill="#E8ECEF" />
    <circle cx="300" cy="330" r="6" fill="#E8ECEF" />
    <circle cx="200" cy="330" r="6" fill="#E8ECEF" />
    <circle cx="170" cy="295" r="6" fill="#E8ECEF" />
    <circle cx="170" cy="205" r="6" fill="#E8ECEF" />
    <circle cx="200" cy="170" r="6" fill="#E8ECEF" />
    <!-- Red GMT Hand with Triangle -->
    <line x1="250" y1="250" x2="190" y2="180" stroke="#D32F2F" stroke-width="2.5" />
    <polygon points="190,180 182,172 198,172" fill="#D32F2F" stroke="#FFF" stroke-width="1" />
    <!-- Mercedes Hands -->
    <line x1="250" y1="250" x2="225" y2="290" stroke="#E8ECEF" stroke-width="4.5" stroke-linecap="round" />
    <circle cx="230" cy="282" r="6" fill="#0D0E12" stroke="#E8ECEF" stroke-width="1.5" />
    <line x1="250" y1="250" x2="295" y2="220" stroke="#E8ECEF" stroke-width="3" stroke-linecap="round" />
    <circle cx="250" cy="250" r="4" fill="#E8ECEF" />
    """
    wrap_watch("rolex-gmt-master-pepsi.svg", gmt_pepsi, "ROLEX", "GMT-MASTER II 'PEPSI'", strap="jubilee", case="round", bezel_color="#0F2B59")

    # 5. Rolex Explorer 36
    explorer_36 = """
    <!-- Polished Steel Smooth Bezel -->
    <circle cx="250" cy="250" r="128" fill="#BCC0CA" stroke="#8E929E" stroke-width="2" />
    <!-- Gloss Black Dial -->
    <circle cx="250" cy="250" r="106" fill="#0D0E11" stroke="#222429" stroke-width="2" />
    <!-- Inverted Triangle at 12 -->
    <polygon points="250,154 240,172 260,172" fill="#E8ECEF" />
    <!-- Iconic 3 - 6 - 9 Numerals in Chromalight -->
    <text x="330" y="258" font-family="'Helvetica Neue', sans-serif" font-size="22" font-weight="bold" fill="#E8ECEF" text-anchor="middle">3</text>
    <text x="250" y="340" font-family="'Helvetica Neue', sans-serif" font-size="22" font-weight="bold" fill="#E8ECEF" text-anchor="middle">6</text>
    <text x="170" y="258" font-family="'Helvetica Neue', sans-serif" font-size="22" font-weight="bold" fill="#E8ECEF" text-anchor="middle">9</text>
    <!-- Hour Batons -->
    <rect x="295" y="172" width="6" height="14" fill="#E8ECEF" transform="rotate(30 298 179)" />
    <rect x="325" y="208" width="6" height="14" fill="#E8ECEF" transform="rotate(60 328 215)" />
    <rect x="325" y="280" width="6" height="14" fill="#E8ECEF" transform="rotate(120 328 287)" />
    <rect x="295" y="316" width="6" height="14" fill="#E8ECEF" transform="rotate(150 298 323)" />
    <rect x="199" y="316" width="6" height="14" fill="#E8ECEF" transform="rotate(210 202 323)" />
    <rect x="169" y="280" width="6" height="14" fill="#E8ECEF" transform="rotate(240 172 287)" />
    <rect x="169" y="208" width="6" height="14" fill="#E8ECEF" transform="rotate(300 172 215)" />
    <rect x="199" y="172" width="6" height="14" fill="#E8ECEF" transform="rotate(330 202 179)" />
    <!-- Mercedes Hands -->
    <line x1="250" y1="250" x2="200" y2="215" stroke="#E8ECEF" stroke-width="4.5" stroke-linecap="round" />
    <circle cx="210" cy="222" r="6" fill="#0D0E11" stroke="#E8ECEF" stroke-width="1.5" />
    <line x1="250" y1="250" x2="250" y2="168" stroke="#E8ECEF" stroke-width="3" stroke-linecap="round" />
    <line x1="250" y1="250" x2="285" y2="305" stroke="#E8ECEF" stroke-width="1" />
    <circle cx="250" cy="250" r="4" fill="#E8ECEF" />
    """
    wrap_watch("rolex-explorer-36.svg", explorer_36, "ROLEX", "EXPLORER 36MM", strap="steel", case="round", bezel_color="#BCC0CA")

    # 6. Omega Speedmaster Moonwatch
    moonwatch = """
    <!-- Black Tachymeter Bezel with Dot over 90 -->
    <circle cx="250" cy="250" r="128" fill="#141517" stroke="#25272B" stroke-width="2" />
    <text x="250" y="132" font-family="sans-serif" font-size="8" fill="#DDD" text-anchor="middle">TACHYMETRE 500</text>
    <text x="362" y="235" font-family="sans-serif" font-size="8" fill="#DDD" text-anchor="middle">200</text>
    <text x="360" y="280" font-family="sans-serif" font-size="8" fill="#DDD" text-anchor="middle">130</text>
    <text x="250" y="372" font-family="sans-serif" font-size="8" fill="#DDD" text-anchor="middle">90 ·</text>
    <text x="138" y="250" font-family="sans-serif" font-size="8" fill="#DDD" text-anchor="middle">60</text>
    <!-- Matte Step Dial -->
    <circle cx="250" cy="250" r="104" fill="#161719" stroke="#2B2D33" stroke-width="2" />
    <!-- 3 Recessed Subdials at 3, 6, 9 -->
    <circle cx="202" cy="250" r="22" fill="#121315" stroke="#3A3D45" stroke-width="1" />
    <circle cx="298" cy="250" r="22" fill="#121315" stroke="#3A3D45" stroke-width="1" />
    <circle cx="250" cy="292" r="22" fill="#121315" stroke="#3A3D45" stroke-width="1" />
    <!-- White Baton Indices -->
    <rect x="248" y="152" width="4" height="14" fill="#F0F0F0" />
    <circle cx="243" cy="155" r="2" fill="#C5A880" />
    <circle cx="257" cy="155" r="2" fill="#C5A880" />
    <!-- Chrono White Baton Hands -->
    <line x1="250" y1="250" x2="215" y2="205" stroke="#F0F0F0" stroke-width="3" stroke-linecap="round" />
    <line x1="250" y1="250" x2="280" y2="175" stroke="#F0F0F0" stroke-width="2.5" stroke-linecap="round" />
    <line x1="250" y1="250" x2="250" y2="155" stroke="#F0F0F0" stroke-width="1" />
    <circle cx="250" cy="250" r="3.5" fill="#F0F0F0" />
    """
    wrap_watch("omega-speedmaster-moonwatch.svg", moonwatch, "OMEGA", "SPEEDMASTER PROFESSIONAL 'MOONWATCH'", strap="steel", case="round", bezel_color="#141517")

    # 7. Omega Seamaster Diver 300M
    seamaster_diver = """
    <!-- Scalloped Diver Bezel in Blue Ceramic -->
    <circle cx="250" cy="250" r="128" fill="#102E5C" stroke="#0B1F3E" stroke-width="3" />
    <polygon points="250,126 244,136 256,136" fill="#F0F0F0" />
    <circle cx="250" cy="133" r="3" fill="#A5C8E4" />
    <text x="360" y="254" font-family="sans-serif" font-size="10" font-weight="bold" fill="#F0F0F0" text-anchor="middle">15</text>
    <text x="250" y="366" font-family="sans-serif" font-size="10" font-weight="bold" fill="#F0F0F0" text-anchor="middle">30</text>
    <text x="140" y="254" font-family="sans-serif" font-size="10" font-weight="bold" fill="#F0F0F0" text-anchor="middle">45</text>
    <!-- Helium valve at 10 o'clock -->
    <rect x="146" y="146" width="14" height="14" fill="#8E929E" rx="2" transform="rotate(45 153 153)" />
    <!-- Blue Laser-Engraved Wave Dial -->
    <circle cx="250" cy="250" r="104" fill="#0E274E" stroke="#081830" stroke-width="2" />
    <!-- Wave lines -->
    <path d="M 160 210 Q 200 205 250 210 T 340 210" fill="none" stroke="#16396E" stroke-width="2" />
    <path d="M 155 230 Q 200 225 250 230 T 345 230" fill="none" stroke="#16396E" stroke-width="2" />
    <path d="M 155 250 Q 200 245 250 250 T 345 250" fill="none" stroke="#16396E" stroke-width="2" />
    <path d="M 160 270 Q 200 265 250 270 T 340 270" fill="none" stroke="#16396E" stroke-width="2" />
    <!-- Applied round luminescent markers -->
    <circle cx="300" cy="170" r="7" fill="#E8ECEF" stroke="#C0C2C8" />
    <circle cx="330" cy="205" r="7" fill="#E8ECEF" stroke="#C0C2C8" />
    <circle cx="330" cy="295" r="7" fill="#E8ECEF" stroke="#C0C2C8" />
    <circle cx="300" cy="330" r="7" fill="#E8ECEF" stroke="#C0C2C8" />
    <circle cx="200" cy="330" r="7" fill="#E8ECEF" stroke="#C0C2C8" />
    <circle cx="170" cy="295" r="7" fill="#E8ECEF" stroke="#C0C2C8" />
    <circle cx="170" cy="205" r="7" fill="#E8ECEF" stroke="#C0C2C8" />
    <circle cx="200" cy="170" r="7" fill="#E8ECEF" stroke="#C0C2C8" />
    <!-- Skeleton Hands -->
    <line x1="250" y1="250" x2="205" y2="215" stroke="#E8ECEF" stroke-width="5" stroke-linecap="round" />
    <line x1="250" y1="250" x2="275" y2="180" stroke="#E8ECEF" stroke-width="3.5" stroke-linecap="round" />
    <line x1="250" y1="250" x2="295" y2="305" stroke="#D32F2F" stroke-width="1.5" />
    <circle cx="250" cy="250" r="5" fill="#E8ECEF" />
    """
    wrap_watch("omega-seamaster-diver-300m.svg", seamaster_diver, "OMEGA", "SEAMASTER DIVER 300M", strap="rubber_blue", case="round", bezel_color="#102E5C")

    # 8. Omega Aqua Terra 150M
    aqua_terra = """
    <!-- Smooth Bezel -->
    <circle cx="250" cy="250" r="128" fill="#C2C6D0" stroke="#8E929E" stroke-width="2" />
    <!-- Silver Teak Concept Dial -->
    <circle cx="250" cy="250" r="106" fill="#EAECEF" stroke="#B8BAC0" stroke-width="1.5" />
    <!-- Teak horizontal planks -->
    <line x1="150" y1="180" x2="350" y2="180" stroke="#D2D6DC" stroke-width="1.5" />
    <line x1="145" y1="195" x2="355" y2="195" stroke="#D2D6DC" stroke-width="1.5" />
    <line x1="144" y1="210" x2="356" y2="210" stroke="#D2D6DC" stroke-width="1.5" />
    <line x1="144" y1="225" x2="356" y2="225" stroke="#D2D6DC" stroke-width="1.5" />
    <line x1="144" y1="240" x2="356" y2="240" stroke="#D2D6DC" stroke-width="1.5" />
    <line x1="144" y1="255" x2="356" y2="255" stroke="#D2D6DC" stroke-width="1.5" />
    <line x1="144" y1="270" x2="356" y2="270" stroke="#D2D6DC" stroke-width="1.5" />
    <line x1="145" y1="285" x2="355" y2="285" stroke="#D2D6DC" stroke-width="1.5" />
    <line x1="150" y1="300" x2="350" y2="300" stroke="#D2D6DC" stroke-width="1.5" />
    <line x1="160" y1="315" x2="340" y2="315" stroke="#D2D6DC" stroke-width="1.5" />
    <!-- Wedge Triangular Markers in Blue -->
    <polygon points="250,150 246,165 254,165" fill="#1C3879" />
    <polygon points="350,250 335,246 335,254" fill="#1C3879" />
    <polygon points="150,250 165,246 165,254" fill="#1C3879" />
    <!-- Date window at 6 -->
    <circle cx="250" cy="326" r="10" fill="#FFF" stroke="#1C3879" stroke-width="1" />
    <text x="250" y="330" font-family="sans-serif" font-size="9" font-weight="bold" fill="#000" text-anchor="middle">8</text>
    <!-- Arrow Minute Hand -->
    <line x1="250" y1="250" x2="200" y2="215" stroke="#1C3879" stroke-width="4" stroke-linecap="round" />
    <line x1="250" y1="250" x2="280" y2="185" stroke="#1C3879" stroke-width="3" stroke-linecap="round" />
    <polygon points="280,185 272,175 288,180" fill="#1C3879" />
    <circle cx="250" cy="250" r="4" fill="#1C3879" />
    """
    wrap_watch("omega-aqua-terra-150m.svg", aqua_terra, "OMEGA", "SEAMASTER AQUA TERRA 150M", strap="steel", case="round", bezel_color="#C2C6D0")

    # 9. Omega Constellation 39
    constellation = """
    <!-- Two-tone Bezel with Claws at 3 and 9 -->
    <circle cx="250" cy="250" r="128" fill="#B38D4F" stroke="#876630" stroke-width="2" />
    <!-- Roman Numerals on Bezel -->
    <text x="250" y="134" font-family="'Times New Roman', serif" font-size="12" fill="#18181A" text-anchor="middle">XII</text>
    <text x="250" y="372" font-family="'Times New Roman', serif" font-size="12" fill="#18181A" text-anchor="middle">VI</text>
    <!-- Iconic Claws -->
    <rect x="364" y="232" width="16" height="36" fill="#DDB976" stroke="#876630" rx="3" />
    <rect x="120" y="232" width="16" height="36" fill="#DDB976" stroke="#876630" rx="3" />
    <!-- Champagne Sunray Dial -->
    <circle cx="250" cy="250" r="106" fill="#E8DEC8" stroke="#C4B79A" stroke-width="1.5" />
    <!-- Constellation Star at 6 -->
    <polygon points="250,305 252,311 258,311 253,315 255,321 250,317 245,321 247,315 242,311 248,311" fill="#B38D4F" />
    <!-- Gold Baton Hands -->
    <line x1="250" y1="250" x2="210" y2="210" stroke="#B38D4F" stroke-width="3.5" stroke-linecap="round" />
    <line x1="250" y1="250" x2="270" y2="175" stroke="#B38D4F" stroke-width="2.5" stroke-linecap="round" />
    <circle cx="250" cy="250" r="4" fill="#B38D4F" />
    """
    wrap_watch("omega-constellation-39.svg", constellation, "OMEGA", "CONSTELLATION CO-AXIAL 39MM", strap="steel", case="round", bezel_color="#B38D4F")

    # 10. Patek Philippe Nautilus 5711
    nautilus = """
    <!-- Horizontally Embossed Blue Dial -->
    <rect x="148" y="152" width="204" height="196" rx="42" fill="#172D47" />
    <line x1="165" y1="180" x2="335" y2="180" stroke="#0E1D2E" stroke-width="3" />
    <line x1="160" y1="200" x2="340" y2="200" stroke="#0E1D2E" stroke-width="3" />
    <line x1="158" y1="220" x2="342" y2="220" stroke="#0E1D2E" stroke-width="3" />
    <line x1="158" y1="240" x2="342" y2="240" stroke="#0E1D2E" stroke-width="3" />
    <line x1="158" y1="260" x2="342" y2="260" stroke="#0E1D2E" stroke-width="3" />
    <line x1="158" y1="280" x2="342" y2="280" stroke="#0E1D2E" stroke-width="3" />
    <line x1="160" y1="300" x2="340" y2="300" stroke="#0E1D2E" stroke-width="3" />
    <line x1="165" y1="320" x2="335" y2="320" stroke="#0E1D2E" stroke-width="3" />
    <!-- Rounded Baton Markers with Lume -->
    <rect x="246" y="162" width="8" height="16" rx="4" fill="#E8ECEF" stroke="#A8ADB8" />
    <rect x="246" y="322" width="8" height="16" rx="4" fill="#E8ECEF" stroke="#A8ADB8" />
    <rect x="162" y="246" width="16" height="8" rx="4" fill="#E8ECEF" stroke="#A8ADB8" />
    <!-- Date window at 3 -->
    <rect x="316" y="242" width="22" height="16" fill="#FFF" />
    <text x="327" y="254" font-family="sans-serif" font-size="11" font-weight="bold" fill="#000" text-anchor="middle">18</text>
    <!-- Rounded Baton Hands -->
    <line x1="250" y1="250" x2="200" y2="225" stroke="#E8ECEF" stroke-width="4.5" stroke-linecap="round" />
    <line x1="250" y1="250" x2="265" y2="175" stroke="#E8ECEF" stroke-width="3.5" stroke-linecap="round" />
    <line x1="250" y1="250" x2="290" y2="305" stroke="#C5A880" stroke-width="1" />
    <circle cx="250" cy="250" r="4.5" fill="#E8ECEF" />
    """
    wrap_watch("patek-philippe-nautilus-5711.svg", nautilus, "PATEK PHILIPPE", "NAUTILUS 5711/1A AZUL IMPERIAL", strap="steel", case="nautilus", bezel_color="#202228")

    # 11. Patek Philippe Calatrava 5227
    calatrava = """
    <!-- Smooth Rose Gold Bezel -->
    <circle cx="250" cy="250" r="128" fill="#E0A78F" stroke="#9E6954" stroke-width="2" />
    <!-- Ivory / Cream Lacquered Dial -->
    <circle cx="250" cy="250" r="108" fill="#F4EFE6" stroke="#D1C6B4" stroke-width="1.5" />
    <!-- Faceted Rose Gold Batons -->
    <polygon points="250,154 247,170 253,170" fill="#B87B64" />
    <polygon points="250,346 247,330 253,330" fill="#B87B64" />
    <polygon points="154,250 170,247 170,253" fill="#B87B64" />
    <!-- Date window at 3 in Gold Frame -->
    <rect x="320" y="242" width="20" height="16" fill="#FFF" stroke="#B87B64" stroke-width="1" />
    <text x="330" y="254" font-family="sans-serif" font-size="10" font-weight="bold" fill="#000" text-anchor="middle">5</text>
    <!-- Dauphine Hands in Rose Gold -->
    <polygon points="250,250 205,225 210,220" fill="#B87B64" />
    <polygon points="250,250 260,170 265,175" fill="#DDA189" />
    <circle cx="250" cy="250" r="3.5" fill="#B87B64" />
    """
    wrap_watch("patek-philippe-calatrava-5227.svg", calatrava, "PATEK PHILIPPE", "CALATRAVA 5227R ORO ROSA", strap="leather_brown", case="round", case_color="#E0A78F", bezel_color="#E0A78F")

    # 12. Patek Philippe Aquanaut 5167
    aquanaut = """
    <!-- Rounded Octagonal Steel Bezel -->
    <circle cx="250" cy="250" r="126" fill="#25272C" stroke="#3D4046" stroke-width="2" />
    <!-- Embossed Geosphere Pattern Dial -->
    <circle cx="250" cy="250" r="104" fill="#141517" stroke="#222" stroke-width="1" />
    <!-- Grid contours -->
    <ellipse cx="250" cy="250" rx="90" ry="40" fill="none" stroke="#202227" stroke-width="2" />
    <ellipse cx="250" cy="250" rx="90" ry="70" fill="none" stroke="#202227" stroke-width="2" />
    <line x1="250" y1="150" x2="250" y2="350" stroke="#202227" stroke-width="2" />
    <line x1="150" y1="250" x2="350" y2="250" stroke="#202227" stroke-width="2" />
    <!-- Applied Gold Arabic Numerals -->
    <text x="250" y="174" font-family="'Helvetica Neue', sans-serif" font-size="16" font-weight="bold" fill="#ECEAE5" text-anchor="middle">12</text>
    <text x="250" y="340" font-family="'Helvetica Neue', sans-serif" font-size="16" font-weight="bold" fill="#ECEAE5" text-anchor="middle">6</text>
    <text x="168" y="256" font-family="'Helvetica Neue', sans-serif" font-size="16" font-weight="bold" fill="#ECEAE5" text-anchor="middle">9</text>
    <!-- Date window at 3 -->
    <rect x="318" y="242" width="20" height="16" fill="#FFF" />
    <text x="328" y="254" font-family="sans-serif" font-size="10" font-weight="bold" fill="#000" text-anchor="middle">24</text>
    <!-- Hands with Lume -->
    <line x1="250" y1="250" x2="210" y2="210" stroke="#ECEAE5" stroke-width="4.5" stroke-linecap="round" />
    <line x1="250" y1="250" x2="270" y2="175" stroke="#ECEAE5" stroke-width="3" stroke-linecap="round" />
    <circle cx="250" cy="250" r="4.5" fill="#ECEAE5" />
    """
    wrap_watch("patek-philippe-aquanaut-5167.svg", aquanaut, "PATEK PHILIPPE", "AQUANAUT 5167A 'JUMBO'", strap="rubber_black", case="round", bezel_color="#25272C")

    # 13. Audemars Piguet Royal Oak Jumbo
    royal_oak = """
    <!-- 8 Hexagonal Screws on Bezel -->
    <circle cx="340" cy="160" r="4" fill="#E8ECEF" stroke="#333" stroke-width="0.5" />
    <circle cx="370" cy="250" r="4" fill="#E8ECEF" stroke="#333" stroke-width="0.5" />
    <circle cx="340" cy="340" r="4" fill="#E8ECEF" stroke="#333" stroke-width="0.5" />
    <circle cx="250" cy="378" r="4" fill="#E8ECEF" stroke="#333" stroke-width="0.5" />
    <circle cx="160" cy="340" r="4" fill="#E8ECEF" stroke="#333" stroke-width="0.5" />
    <circle cx="130" cy="250" r="4" fill="#E8ECEF" stroke="#333" stroke-width="0.5" />
    <circle cx="160" cy="160" r="4" fill="#E8ECEF" stroke="#333" stroke-width="0.5" />
    <circle cx="250" cy="122" r="4" fill="#E8ECEF" stroke="#333" stroke-width="0.5" />
    <!-- Petite Tapisserie Blue Dial -->
    <circle cx="250" cy="250" r="102" fill="#13263E" stroke="#0B1624" stroke-width="2" />
    <!-- Grid -->
    <pattern id="tapisserie" width="10" height="10" patternUnits="userSpaceOnUse">
      <rect width="9" height="9" fill="#173151" stroke="#0D1B2B" stroke-width="0.5" />
    </pattern>
    <circle cx="250" cy="250" r="100" fill="url(#tapisserie)" />
    <!-- Double Baton at 12 -->
    <rect x="245" y="160" width="4" height="16" fill="#E8ECEF" />
    <rect x="251" y="160" width="4" height="16" fill="#E8ECEF" />
    <!-- Date at 3 -->
    <rect x="318" y="242" width="22" height="16" fill="#FFF" />
    <text x="329" y="254" font-family="sans-serif" font-size="11" font-weight="bold" fill="#000" text-anchor="middle">12</text>
    <!-- Royal Oak Hands -->
    <line x1="250" y1="250" x2="205" y2="215" stroke="#E8ECEF" stroke-width="4.5" stroke-linecap="round" />
    <line x1="250" y1="250" x2="265" y2="175" stroke="#E8ECEF" stroke-width="3" stroke-linecap="round" />
    <circle cx="250" cy="250" r="4" fill="#E8ECEF" />
    """
    wrap_watch("audemars-piguet-royal-oak-jumbo.svg", royal_oak, "AUDEMARS PIGUET", "ROYAL OAK 'JUMBO' EXTRA-THIN", strap="steel", case="octagonal", bezel_color="#C0C4CC")

    # 14. Audemars Piguet Royal Oak Offshore Chronograph
    ap_offshore = """
    <!-- Black Ceramic Octagonal Bezel with Screws -->
    <circle cx="340" cy="160" r="4" fill="#E8ECEF" />
    <circle cx="370" cy="250" r="4" fill="#E8ECEF" />
    <circle cx="340" cy="340" r="4" fill="#E8ECEF" />
    <circle cx="250" cy="378" r="4" fill="#E8ECEF" />
    <circle cx="160" cy="340" r="4" fill="#E8ECEF" />
    <circle cx="130" cy="250" r="4" fill="#E8ECEF" />
    <circle cx="160" cy="160" r="4" fill="#E8ECEF" />
    <circle cx="250" cy="122" r="4" fill="#E8ECEF" />
    <!-- Chrono pushers -->
    <rect x="360" y="165" width="24" height="16" fill="#181A1D" rx="3" transform="rotate(35 372 173)" />
    <rect x="360" y="320" width="24" height="16" fill="#181A1D" rx="3" transform="rotate(-35 372 328)" />
    <!-- Black Méga Tapisserie Dial -->
    <circle cx="250" cy="250" r="102" fill="#111215" stroke="#222" stroke-width="2" />
    <!-- Subdials at 6, 9, 12 -->
    <circle cx="250" cy="195" r="18" fill="#1D2026" stroke="#444" stroke-width="1" />
    <circle cx="205" cy="250" r="18" fill="#1D2026" stroke="#444" stroke-width="1" />
    <circle cx="250" cy="305" r="18" fill="#1D2026" stroke="#444" stroke-width="1" />
    <!-- Date Magnifier at 3 -->
    <circle cx="295" cy="250" r="12" fill="#FFF" stroke="#666" stroke-width="1.5" />
    <text x="295" y="254" font-family="sans-serif" font-size="10" font-weight="bold" fill="#000" text-anchor="middle">21</text>
    <!-- Bold Hands -->
    <line x1="250" y1="250" x2="220" y2="220" stroke="#FFF" stroke-width="5" stroke-linecap="round" />
    <line x1="250" y1="250" x2="275" y2="185" stroke="#FFF" stroke-width="3.5" stroke-linecap="round" />
    <line x1="250" y1="250" x2="250" y2="160" stroke="#E63946" stroke-width="1.5" />
    <circle cx="250" cy="250" r="4.5" fill="#FFF" />
    """
    wrap_watch("audemars-piguet-royal-oak-offshore.svg", ap_offshore, "AUDEMARS PIGUET", "ROYAL OAK OFFSHORE CHRONO", strap="rubber_black", case="octagonal", bezel_color="#181A1D")

    # 15. Audemars Piguet Code 11.59
    ap_code1159 = """
    <!-- Double-Curved Sapphire Bezel Ring -->
    <circle cx="250" cy="250" r="128" fill="#1D212A" stroke="#333844" stroke-width="2" />
    <!-- Smoked Sunburst Blue Dial -->
    <circle cx="250" cy="250" r="108" fill="#0F1E33" stroke="#08101C" stroke-width="2" />
    <!-- Numerals 12, 3, 6, 9 in Rose Gold -->
    <text x="250" y="174" font-family="'Cinzel', serif" font-size="18" fill="#E0A78F" text-anchor="middle">12</text>
    <text x="330" y="256" font-family="'Cinzel', serif" font-size="18" fill="#E0A78F" text-anchor="middle">3</text>
    <text x="250" y="338" font-family="'Cinzel', serif" font-size="18" fill="#E0A78F" text-anchor="middle">6</text>
    <text x="170" y="256" font-family="'Cinzel', serif" font-size="18" fill="#E0A78F" text-anchor="middle">9</text>
    <!-- Slender Rose Gold Hands -->
    <line x1="250" y1="250" x2="215" y2="215" stroke="#E0A78F" stroke-width="3" stroke-linecap="round" />
    <line x1="250" y1="250" x2="270" y2="180" stroke="#E0A78F" stroke-width="2" stroke-linecap="round" />
    <line x1="250" y1="250" x2="280" y2="300" stroke="#E0A78F" stroke-width="1" />
    <circle cx="250" cy="250" r="3.5" fill="#E0A78F" />
    """
    wrap_watch("audemars-piguet-code-1159.svg", ap_code1159, "AUDEMARS PIGUET", "CODE 11.59 AUTOMATIQUE", strap="leather_blue", case="round", case_color="#C0C4CC", bezel_color="#1D212A")

    # 16. Cartier Santos Large
    cartier_santos = """
    <!-- Square Bezel with 8 Screws -->
    <circle cx="155" cy="155" r="3" fill="#666" />
    <circle cx="250" cy="148" r="3" fill="#666" />
    <circle cx="345" cy="155" r="3" fill="#666" />
    <circle cx="352" cy="250" r="3" fill="#666" />
    <circle cx="345" cy="345" r="3" fill="#666" />
    <circle cx="250" cy="352" r="3" fill="#666" />
    <circle cx="155" cy="345" r="3" fill="#666" />
    <circle cx="148" cy="250" r="3" fill="#666" />
    <!-- Opaline Dial with Roman Numerals -->
    <rect x="160" y="160" width="180" height="180" rx="6" fill="#F4F4F6" stroke="#D1D3D8" stroke-width="1.5" />
    <!-- Railtrack minuterie -->
    <rect x="195" y="195" width="110" height="110" fill="none" stroke="#222" stroke-width="1" />
    <!-- Roman Numerals -->
    <text x="250" y="184" font-family="'Times New Roman', serif" font-size="16" font-weight="bold" fill="#111" text-anchor="middle">XII</text>
    <text x="250" y="328" font-family="'Times New Roman', serif" font-size="16" font-weight="bold" fill="#111" text-anchor="middle">VI</text>
    <text x="322" y="256" font-family="'Times New Roman', serif" font-size="16" font-weight="bold" fill="#111" text-anchor="middle">III</text>
    <text x="178" y="256" font-family="'Times New Roman', serif" font-size="16" font-weight="bold" fill="#111" text-anchor="middle">IX</text>
    <!-- Blued Steel Sword Hands -->
    <polygon points="250,250 215,225 210,230" fill="#1C3879" />
    <polygon points="250,250 260,185 265,190" fill="#1C3879" />
    <circle cx="250" cy="250" r="3" fill="#1C3879" />
    """
    wrap_watch("cartier-santos-large.svg", cartier_santos, "CARTIER", "SANTOS DE CARTIER GRANDE", strap="steel", case="square", bezel_color="#E2E4E8")

    # 17. Cartier Tank Must
    cartier_tank = """
    <!-- Pure Opaline Silver Dial -->
    <rect x="170" y="150" width="160" height="200" fill="#F3F3F5" stroke="#C5C7CC" stroke-width="1" />
    <!-- Inner Railtrack -->
    <rect x="195" y="175" width="110" height="150" fill="none" stroke="#222" stroke-width="1.5" />
    <!-- Roman Numerals -->
    <text x="250" y="170" font-family="'Times New Roman', serif" font-size="17" font-weight="bold" fill="#111" text-anchor="middle">XII</text>
    <text x="250" y="344" font-family="'Times New Roman', serif" font-size="17" font-weight="bold" fill="#111" text-anchor="middle">VI</text>
    <text x="318" y="256" font-family="'Times New Roman', serif" font-size="15" font-weight="bold" fill="#111" text-anchor="middle">III</text>
    <text x="182" y="256" font-family="'Times New Roman', serif" font-size="15" font-weight="bold" fill="#111" text-anchor="middle">IX</text>
    <!-- Blued Steel Sword Hands -->
    <line x1="250" y1="250" x2="225" y2="210" stroke="#1C3879" stroke-width="3" stroke-linecap="round" />
    <line x1="250" y1="250" x2="250" y2="185" stroke="#1C3879" stroke-width="2" stroke-linecap="round" />
    <circle cx="250" cy="250" r="3" fill="#1C3879" />
    """
    wrap_watch("cartier-tank-must.svg", cartier_tank, "CARTIER", "TANK MUST GRANDE", strap="leather_black", case="tank", case_color="#D5D8E0", bezel_color="#F3F3F5")

    # 18. Cartier Ballon Bleu 40
    ballon_bleu = """
    <!-- Protective Crown Arch at 3 -->
    <ellipse cx="340" cy="250" rx="20" ry="24" fill="#C2C5CD" stroke="#181A1D" stroke-width="1.5" />
    <circle cx="345" cy="250" r="9" fill="#1C3879" />
    <!-- Guilloché Dial -->
    <circle cx="250" cy="250" r="106" fill="#F0F1F5" stroke="#D1D4DC" stroke-width="2" />
    <circle cx="250" cy="250" r="55" fill="none" stroke="#D8DBE2" stroke-width="1" stroke-dasharray="2 3" />
    <!-- Roman Numerals (Curved around arch) -->
    <text x="250" y="170" font-family="'Times New Roman', serif" font-size="18" fill="#111" text-anchor="middle">XII</text>
    <text x="250" y="340" font-family="'Times New Roman', serif" font-size="18" fill="#111" text-anchor="middle">VI</text>
    <text x="168" y="256" font-family="'Times New Roman', serif" font-size="18" fill="#111" text-anchor="middle">IX</text>
    <!-- Blued Sword Hands -->
    <line x1="250" y1="250" x2="215" y2="215" stroke="#1C3879" stroke-width="3.5" stroke-linecap="round" />
    <line x1="250" y1="250" x2="270" y2="180" stroke="#1C3879" stroke-width="2.5" stroke-linecap="round" />
    <circle cx="250" cy="250" r="3.5" fill="#1C3879" />
    """
    wrap_watch("cartier-ballon-bleu-40.svg", ballon_bleu, "CARTIER", "BALLON BLEU DE CARTIER 40MM", strap="steel", case="round", bezel_color="#C2C5CD")

    # 19. TAG Heuer Monaco Calibre 11
    tag_monaco = """
    <!-- Crown on Left (9 o'clock) -->
    <rect x="110" y="238" width="15" height="24" fill="#C2C5CD" rx="2" stroke="#222" />
    <!-- Chrono pushers at 2 and 4 on Right -->
    <rect x="375" y="155" width="18" height="24" fill="#C2C5CD" rx="2" stroke="#222" transform="rotate(25 384 167)" />
    <rect x="375" y="320" width="18" height="24" fill="#C2C5CD" rx="2" stroke="#222" transform="rotate(-25 384 332)" />
    <!-- Petroleum Blue Square Dial -->
    <rect x="150" y="150" width="200" height="200" rx="8" fill="#17345C" stroke="#0D1E36" stroke-width="2" />
    <!-- 2 Silver Rounded-Square Subdials -->
    <rect x="175" y="228" width="44" height="44" rx="6" fill="#DCE0E8" stroke="#333" stroke-width="1.5" />
    <rect x="281" y="228" width="44" height="44" rx="6" fill="#DCE0E8" stroke="#333" stroke-width="1.5" />
    <line x1="197" y1="250" x2="197" y2="238" stroke="#E63946" stroke-width="1.5" />
    <line x1="303" y1="250" x2="311" y2="250" stroke="#E63946" stroke-width="1.5" />
    <!-- Date at 6 -->
    <rect x="238" y="324" width="24" height="16" fill="#FFF" />
    <text x="250" y="336" font-family="sans-serif" font-size="10" font-weight="bold" fill="#000" text-anchor="middle">15</text>
    <!-- Red Hands & Accents -->
    <line x1="250" y1="250" x2="220" y2="200" stroke="#FFF" stroke-width="4" stroke-linecap="round" />
    <line x1="250" y1="250" x2="280" y2="185" stroke="#FFF" stroke-width="3" stroke-linecap="round" />
    <line x1="250" y1="250" x2="250" y2="160" stroke="#E63946" stroke-width="1.5" />
    <circle cx="250" cy="250" r="4.5" fill="#E63946" />
    """
    wrap_watch("tag-heuer-monaco-calibre-11.svg", tag_monaco, "TAG HEUER", "MONACO CALIBRE 11", strap="leather_black", case="square", bezel_color="#C0C4CC")

    # 20. TAG Heuer Carrera Glassbox
    tag_carrera = """
    <!-- Glassbox Domed Bezel -->
    <circle cx="250" cy="250" r="128" fill="#132B4F" stroke="#25272B" stroke-width="2" />
    <text x="250" y="132" font-family="monospace" font-size="8" fill="#8EA8D0" text-anchor="middle">TACHYMETRE</text>
    <!-- Deep Blue Brushed Dial -->
    <circle cx="250" cy="250" r="106" fill="#0D203D" stroke="#071224" stroke-width="2" />
    <!-- 2 Subdials at 3 and 9 -->
    <circle cx="202" cy="250" r="22" fill="#122A4E" stroke="#5A7BA8" stroke-width="1" />
    <circle cx="298" cy="250" r="22" fill="#122A4E" stroke="#5A7BA8" stroke-width="1" />
    <!-- Silver Batons -->
    <rect x="247" y="152" width="6" height="12" fill="#E8ECEF" />
    <!-- Orange/Red tipped seconds hand -->
    <line x1="250" y1="250" x2="210" y2="210" stroke="#E8ECEF" stroke-width="3.5" stroke-linecap="round" />
    <line x1="250" y1="250" x2="275" y2="175" stroke="#E8ECEF" stroke-width="2.5" stroke-linecap="round" />
    <line x1="250" y1="250" x2="250" y2="155" stroke="#F77F00" stroke-width="1.5" />
    <circle cx="250" cy="250" r="4" fill="#E8ECEF" />
    """
    wrap_watch("tag-heuer-carrera-glassbox.svg", tag_carrera, "TAG HEUER", "CARRERA GLASSBOX 39MM", strap="leather_blue", case="round", bezel_color="#132B4F")

    # 21. TAG Heuer Aquaracer 300
    tag_aquaracer = """
    <!-- 12-sided Dodecagonal Bezel in Black Ceramic -->
    <circle cx="250" cy="250" r="128" fill="#16181C" stroke="#2B2E35" stroke-width="3" />
    <polygon points="250,126 244,136 256,136" fill="#FFF" />
    <text x="360" y="254" font-family="sans-serif" font-size="10" font-weight="bold" fill="#FFF" text-anchor="middle">15</text>
    <text x="250" y="366" font-family="sans-serif" font-size="10" font-weight="bold" fill="#FFF" text-anchor="middle">30</text>
    <text x="140" y="254" font-family="sans-serif" font-size="10" font-weight="bold" fill="#FFF" text-anchor="middle">45</text>
    <!-- Black Dial with Horizontal Grooves -->
    <circle cx="250" cy="250" r="102" fill="#111215" stroke="#222" stroke-width="2" />
    <line x1="160" y1="200" x2="340" y2="200" stroke="#1D2026" stroke-width="2" />
    <line x1="155" y1="220" x2="345" y2="220" stroke="#1D2026" stroke-width="2" />
    <line x1="155" y1="240" x2="345" y2="240" stroke="#1D2026" stroke-width="2" />
    <line x1="155" y1="260" x2="345" y2="260" stroke="#1D2026" stroke-width="2" />
    <line x1="160" y1="280" x2="340" y2="280" stroke="#1D2026" stroke-width="2" />
    <!-- Octagonal Applied Markers -->
    <circle cx="300" cy="170" r="6" fill="#E8ECEF" stroke="#A8ADB8" />
    <circle cx="330" cy="205" r="6" fill="#E8ECEF" stroke="#A8ADB8" />
    <circle cx="330" cy="295" r="6" fill="#E8ECEF" stroke="#A8ADB8" />
    <circle cx="300" cy="330" r="6" fill="#E8ECEF" stroke="#A8ADB8" />
    <circle cx="200" cy="330" r="6" fill="#E8ECEF" stroke="#A8ADB8" />
    <circle cx="170" cy="295" r="6" fill="#E8ECEF" stroke="#A8ADB8" />
    <circle cx="170" cy="205" r="6" fill="#E8ECEF" stroke="#A8ADB8" />
    <circle cx="200" cy="170" r="6" fill="#E8ECEF" stroke="#A8ADB8" />
    <!-- Hands with Yellow Tip on Seconds -->
    <line x1="250" y1="250" x2="205" y2="215" stroke="#E8ECEF" stroke-width="4.5" stroke-linecap="round" />
    <line x1="250" y1="250" x2="275" y2="180" stroke="#E8ECEF" stroke-width="3" stroke-linecap="round" />
    <line x1="250" y1="250" x2="295" y2="305" stroke="#F4A261" stroke-width="1.5" />
    <circle cx="250" cy="250" r="4.5" fill="#E8ECEF" />
    """
    wrap_watch("tag-heuer-aquaracer-300.svg", tag_aquaracer, "TAG HEUER", "AQUARACER PROFESSIONAL 300", strap="steel", case="round", bezel_color="#16181C")

    # 22. Grand Seiko Snowflake SBGA211
    gs_snowflake = """
    <!-- Titanium Zaratsu Polished Bezel -->
    <circle cx="250" cy="250" r="128" fill="#CCD0D8" stroke="#8E929E" stroke-width="2" />
    <!-- Pristine White Snowflake Textured Dial -->
    <circle cx="250" cy="250" r="106" fill="#FAFAFC" stroke="#D8DBE2" stroke-width="1.5" />
    <!-- Faceted Zaratsu Indices -->
    <rect x="247" y="152" width="6" height="15" fill="#666972" stroke="#444" stroke-width="0.5" />
    <rect x="247" y="333" width="6" height="15" fill="#666972" stroke="#444" stroke-width="0.5" />
    <rect x="152" y="247" width="15" height="6" fill="#666972" stroke="#444" stroke-width="0.5" />
    <!-- Power reserve indicator at 8 o'clock -->
    <path d="M 195 285 A 25 25 0 0 1 225 305" fill="none" stroke="#1C3879" stroke-width="2" />
    <line x1="220" y1="295" x2="228" y2="303" stroke="#1C3879" stroke-width="1.5" />
    <!-- Date window at 3 -->
    <rect x="320" y="242" width="22" height="16" fill="#FFF" stroke="#666" stroke-width="1" />
    <text x="331" y="254" font-family="sans-serif" font-size="11" font-weight="bold" fill="#000" text-anchor="middle">10</text>
    <!-- Razor Sharp Dauphine Hands & Blued Steel Seconds -->
    <polygon points="250,250 205,225 210,218" fill="#4B4E56" />
    <polygon points="250,250 260,172 268,176" fill="#6B6F7A" />
    <line x1="250" y1="250" x2="295" y2="305" stroke="#1B3B7A" stroke-width="1.5" />
    <circle cx="250" cy="250" r="3.5" fill="#1B3B7A" />
    """
    wrap_watch("grand-seiko-snowflake-sbga211.svg", gs_snowflake, "GRAND SEIKO", "HERITAGE 'SNOWFLAKE' SBGA211", strap="steel", case="round", bezel_color="#CCD0D8")

    # 23. Grand Seiko White Birch SLGH005
    gs_white_birch = """
    <!-- Evolution 9 Zaratsu Case -->
    <circle cx="250" cy="250" r="128" fill="#D0D4DC" stroke="#8E929E" stroke-width="2" />
    <!-- White Birch Bark Organic Texture Dial -->
    <circle cx="250" cy="250" r="106" fill="#F2F3F6" stroke="#D1D4DC" stroke-width="1.5" />
    <!-- Bark vertical striations -->
    <path d="M 180 160 Q 185 240 180 340" fill="none" stroke="#DCDFE5" stroke-width="3" />
    <path d="M 215 150 Q 220 250 215 350" fill="none" stroke="#DCDFE5" stroke-width="3" />
    <path d="M 285 150 Q 280 250 285 350" fill="none" stroke="#DCDFE5" stroke-width="3" />
    <path d="M 320 160 Q 315 240 320 340" fill="none" stroke="#DCDFE5" stroke-width="3" />
    <!-- Evolution 9 Bold Grooved Indices -->
    <rect x="246" y="152" width="8" height="16" fill="#444852" />
    <rect x="246" y="332" width="8" height="16" fill="#444852" />
    <rect x="152" y="246" width="16" height="8" fill="#444852" />
    <!-- Date window at 3 -->
    <rect x="320" y="242" width="22" height="16" fill="#FFF" stroke="#444" stroke-width="1" />
    <text x="331" y="254" font-family="sans-serif" font-size="11" font-weight="bold" fill="#000" text-anchor="middle">3</text>
    <!-- Truncated Hour Hand and Slender Minute Hand -->
    <polygon points="250,250 210,225 215,220" fill="#3D4048" />
    <polygon points="250,250 262,170 268,174" fill="#585D68" />
    <line x1="250" y1="250" x2="280" y2="305" stroke="#1C3879" stroke-width="1.5" />
    <circle cx="250" cy="250" r="3.5" fill="#1C3879" />
    """
    wrap_watch("grand-seiko-white-birch-slgh005.svg", gs_white_birch, "GRAND SEIKO", "EVOLUTION 9 'WHITE BIRCH'", strap="steel", case="round", bezel_color="#D0D4DC")

    # 24. Grand Seiko Sport GMT SBGE201
    gs_sport_gmt = """
    <!-- Sapphire Covered 24-hr Rotating Bezel -->
    <circle cx="250" cy="250" r="130" fill="#121316" stroke="#25272B" stroke-width="3" />
    <circle cx="250" cy="250" r="126" fill="none" stroke="#3D4046" stroke-width="1" />
    <text x="250" y="132" font-family="sans-serif" font-size="11" font-weight="bold" fill="#FFF" text-anchor="middle">24</text>
    <text x="366" y="254" font-family="sans-serif" font-size="11" font-weight="bold" fill="#FFF" text-anchor="middle">6</text>
    <text x="250" y="374" font-family="sans-serif" font-size="11" font-weight="bold" fill="#FFF" text-anchor="middle">12</text>
    <text x="134" y="254" font-family="sans-serif" font-size="11" font-weight="bold" fill="#FFF" text-anchor="middle">18</text>
    <!-- Jet Black Dial -->
    <circle cx="250" cy="250" r="102" fill="#0C0D0F" stroke="#222" stroke-width="2" />
    <!-- Red GMT Hand -->
    <line x1="250" y1="250" x2="200" y2="180" stroke="#D32F2F" stroke-width="2.5" />
    <polygon points="200,180 192,172 208,172" fill="#D32F2F" />
    <!-- Power reserve at 9 o'clock -->
    <path d="M 180 240 A 20 20 0 0 1 180 260" fill="none" stroke="#FFF" stroke-width="1.5" />
    <!-- Date window at 4 -->
    <rect x="306" y="286" width="20" height="15" fill="#FFF" />
    <text x="316" y="297" font-family="sans-serif" font-size="10" font-weight="bold" fill="#000" text-anchor="middle">24</text>
    <!-- Luminescent Hands -->
    <line x1="250" y1="250" x2="215" y2="225" stroke="#E8ECEF" stroke-width="4.5" stroke-linecap="round" />
    <line x1="250" y1="250" x2="270" y2="175" stroke="#E8ECEF" stroke-width="3" stroke-linecap="round" />
    <circle cx="250" cy="250" r="4.5" fill="#E8ECEF" />
    """
    wrap_watch("grand-seiko-sport-gmt-sbge201.svg", gs_sport_gmt, "GRAND SEIKO", "SPORT COLLECTION SPRING DRIVE GMT", strap="steel", case="round", bezel_color="#121316")

    print(f"Generated 24 watch SVGs + 1 master placeholder in {SVG_DIR}")

if __name__ == "__main__":
    generate_all()
