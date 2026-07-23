# -*- coding: utf-8 -*-
"""Generate a clean, rich mock dataset of volunteer/exchange opportunities for the demo app.

Run from anywhere:  python scripts/generate_mock_data.py
Writes to src/data/opportunities.json relative to the app root.
"""
import json, os, random

random.seed(42)
OUT = os.path.join(os.path.dirname(__file__), "..", "src", "data", "opportunities.json")

# (city, country, iso2, lat, lng, region)
CITIES = [
    ("Chennai", "India", "IN", 13.0827, 80.2707, "Asia"),
    ("Mumbai", "India", "IN", 19.0760, 72.8777, "Asia"),
    ("New Delhi", "India", "IN", 28.6139, 77.2090, "Asia"),
    ("Bengaluru", "India", "IN", 12.9716, 77.5946, "Asia"),
    ("Tunis", "Tunisia", "TN", 36.8065, 10.1815, "Africa"),
    ("Sfax", "Tunisia", "TN", 34.7406, 10.7603, "Africa"),
    ("Cairo", "Egypt", "EG", 30.0444, 31.2357, "Africa"),
    ("Alexandria", "Egypt", "EG", 31.2001, 29.9187, "Africa"),
    ("Istanbul", "Turkiye", "TR", 41.0082, 28.9784, "Europe"),
    ("Ankara", "Turkiye", "TR", 39.9334, 32.8597, "Asia"),
    ("Ho Chi Minh City", "Vietnam", "VN", 10.8231, 106.6297, "Asia"),
    ("Hanoi", "Vietnam", "VN", 21.0278, 105.8342, "Asia"),
    ("Colombo", "Sri Lanka", "LK", 6.9271, 79.8612, "Asia"),
    ("Kathmandu", "Nepal", "NP", 27.7172, 85.3240, "Asia"),
    ("Bucharest", "Romania", "RO", 44.4268, 26.1025, "Europe"),
    ("Cluj-Napoca", "Romania", "RO", 46.7712, 23.6236, "Europe"),
    ("Baku", "Azerbaijan", "AZ", 40.4093, 49.8671, "Asia"),
    ("Jakarta", "Indonesia", "ID", -6.2088, 106.8456, "Asia"),
    ("Bandung", "Indonesia", "ID", -6.9175, 107.6191, "Asia"),
    ("Lisbon", "Portugal", "PT", 38.7223, -9.1393, "Europe"),
    ("Porto", "Portugal", "PT", 41.1579, -8.6291, "Europe"),
    ("Sao Paulo", "Brazil", "BR", -23.5558, -46.6396, "Americas"),
    ("Rio de Janeiro", "Brazil", "BR", -22.9068, -43.1729, "Americas"),
    ("Milan", "Italy", "IT", 45.4642, 9.1900, "Europe"),
    ("Rome", "Italy", "IT", 41.9028, 12.4964, "Europe"),
    ("Bangkok", "Thailand", "TH", 13.7563, 100.5018, "Asia"),
    ("Belgrade", "Serbia", "RS", 44.7866, 20.4489, "Europe"),
    ("Casablanca", "Morocco", "MA", 33.5731, -7.5898, "Africa"),
    ("Buenos Aires", "Argentina", "AR", -34.6037, -58.3816, "Americas"),
    ("Panama City", "Panama", "PA", 8.9824, -79.5199, "Americas"),
    ("Abidjan", "Cote d'Ivoire", "CI", 5.3600, -4.0083, "Africa"),
    ("Seoul", "South Korea", "KR", 37.5665, 126.9780, "Asia"),
    ("Athens", "Greece", "GR", 37.9838, 23.7275, "Europe"),
    ("Warsaw", "Poland", "PL", 52.2297, 21.0122, "Europe"),
    ("Krakow", "Poland", "PL", 50.0647, 19.9450, "Europe"),
    ("Amman", "Jordan", "JO", 31.9454, 35.9284, "Asia"),
    ("Dar es Salaam", "Tanzania", "TZ", -6.7924, 39.2083, "Africa"),
    ("Lima", "Peru", "PE", -12.0464, -77.0428, "Americas"),
    ("Budapest", "Hungary", "HU", 47.4979, 19.0402, "Europe"),
    ("Bogota", "Colombia", "CO", 4.7110, -74.0721, "Americas"),
    ("Brussels", "Belgium", "BE", 50.8503, 4.3517, "Europe"),
    ("Mexico City", "Mexico", "MX", 19.4326, -99.1332, "Americas"),
    ("Santiago", "Chile", "CL", -33.4489, -70.6693, "Americas"),
    ("Amsterdam", "Netherlands", "NL", 52.3676, 4.9041, "Europe"),
    ("Kampala", "Uganda", "UG", 0.3476, 32.5825, "Africa"),
    ("Lagos", "Nigeria", "NG", 6.5244, 3.3792, "Africa"),
    ("Berlin", "Germany", "DE", 52.5200, 13.4050, "Europe"),
    ("Nairobi", "Kenya", "KE", -1.2921, 36.8219, "Africa"),
    ("Taipei", "Taiwan", "TW", 25.0330, 121.5654, "Asia"),
    ("Tokyo", "Japan", "JP", 35.6762, 139.6503, "Asia"),
]

SDGS = [
    ("Quality Education", 4, "#C5192D"),
    ("Decent Work and Economic Growth", 8, "#A21942"),
    ("Partnerships for the Goals", 17, "#19486A"),
    ("Good Health and Well-Being", 3, "#4C9F38"),
    ("Climate Action", 13, "#3F7E44"),
    ("Responsible Consumption and Production", 12, "#BF8B2E"),
    ("Life on Land", 15, "#56C02B"),
    ("Life Below Water", 14, "#0A97D9"),
    ("Reduced Inequalities", 10, "#DD1367"),
    ("Gender Equality", 5, "#FF3A21"),
    ("No Poverty", 1, "#E5243B"),
    ("Zero Hunger", 2, "#DDA63A"),
    ("Sustainable Cities and Communities", 11, "#FD9D24"),
    ("Clean Water and Sanitation", 6, "#26BDE2"),
    ("Affordable and Clean Energy", 7, "#FCC30B"),
]

LANGS = ["English", "Spanish", "French", "German", "Portuguese", "Arabic",
         "Mandarin", "Italian", "Russian", "Turkish", "Vietnamese", "Hindi", "Japanese"]
LEVELS = ["Basic", "Intermediate", "Fluent", "Native"]

FIELDS = ["Business Administration", "Marketing", "Communication & Journalism",
          "Computer Science", "Information Technology", "Engineering", "Education",
          "Medicine & Health Sciences", "Environmental Science", "Social Sciences",
          "Economics & Finance", "Design & Arts", "Law", "Psychology",
          "International Relations", "Tourism & Hospitality", "Agriculture"]

# Preferred fields of study, keyed by exact title, so the matcher's field
# signal lines up with the role (otherwise a dev role could "prefer" Marketing).
FIELDS_BY_TITLE = {
    # --- volunteer ---
    "Empower Youth Through Education": ["Education", "Social Sciences", "Psychology"],
    "Teach English to Local Communities": ["Education", "Communication & Journalism", "Social Sciences"],
    "Sustainable Farming & Climate Action": ["Environmental Science", "Agriculture", "Engineering"],
    "Mental Health Awareness Campaign": ["Psychology", "Medicine & Health Sciences", "Social Sciences"],
    "Ocean Conservation Volunteer": ["Environmental Science", "Agriculture"],
    "Digital Literacy for All": ["Information Technology", "Computer Science", "Education"],
    "Women Empowerment Project": ["Social Sciences", "Law", "International Relations"],
    "Clean Water Initiative": ["Environmental Science", "Engineering"],
    "Community Health Educator": ["Medicine & Health Sciences", "Education", "Psychology"],
    "Youth Leadership Bootcamp": ["Business Administration", "Social Sciences", "Education"],
    "Cultural Exchange Ambassador": ["International Relations", "Communication & Journalism", "Tourism & Hospitality"],
    "Renewable Energy Awareness": ["Environmental Science", "Engineering"],
    "Support Local Entrepreneurs": ["Business Administration", "Economics & Finance", "Marketing"],
    "Wildlife Protection Program": ["Environmental Science", "Agriculture"],
    "Inclusive Education Facilitator": ["Education", "Social Sciences", "Psychology"],
    "Financial Literacy Workshops": ["Economics & Finance", "Business Administration", "Education"],
    # --- talent ---
    "Sales Internship": ["Business Administration", "Marketing", "Communication & Journalism"],
    "Software Engineer Intern": ["Computer Science", "Information Technology", "Engineering"],
    "Marketing Specialist": ["Marketing", "Business Administration", "Communication & Journalism"],
    "Financial Analyst": ["Economics & Finance", "Business Administration"],
    "Talent Acquisition Specialist": ["Business Administration", "Psychology", "Social Sciences"],
    "Data Analyst Intern": ["Computer Science", "Information Technology", "Economics & Finance"],
    "Product Marketing Associate": ["Marketing", "Business Administration", "Communication & Journalism"],
    "Business Development Intern": ["Business Administration", "Economics & Finance", "Marketing"],
    "Frontend Developer Intern": ["Computer Science", "Information Technology", "Design & Arts"],
    "Customer Success Associate": ["Business Administration", "Communication & Journalism"],
    "Supply Chain Analyst": ["Engineering", "Business Administration", "Economics & Finance"],
    "Content & Social Media Intern": ["Marketing", "Communication & Journalism", "Design & Arts"],
    "HR Operations Intern": ["Business Administration", "Psychology", "Social Sciences"],
    "UX/UI Design Intern": ["Design & Arts", "Computer Science", "Information Technology"],
    # --- teacher ---
    "English Teacher - Primary School": ["Education", "Communication & Journalism"],
    "English Teacher - High School": ["Education", "Communication & Journalism", "Social Sciences"],
    "ESL Instructor for Adults": ["Education", "Communication & Journalism"],
    "Kindergarten English Educator": ["Education", "Psychology"],
    "Conversational English Facilitator": ["Education", "Communication & Journalism"],
    "Academic English Tutor": ["Education", "Communication & Journalism", "Social Sciences"],
}

# programme, [title templates], work areas
VOL_TITLES = [
    "Empower Youth Through Education", "Teach English to Local Communities",
    "Sustainable Farming & Climate Action", "Mental Health Awareness Campaign",
    "Ocean Conservation Volunteer", "Digital Literacy for All",
    "Women Empowerment Project", "Clean Water Initiative",
    "Community Health Educator", "Youth Leadership Bootcamp",
    "Cultural Exchange Ambassador", "Renewable Energy Awareness",
    "Support Local Entrepreneurs", "Wildlife Protection Program",
    "Inclusive Education Facilitator", "Financial Literacy Workshops",
]
TAL_TITLES = [
    "Sales Internship", "Software Engineer Intern", "Marketing Specialist",
    "Financial Analyst", "Talent Acquisition Specialist", "Data Analyst Intern",
    "Product Marketing Associate", "Business Development Intern",
    "Frontend Developer Intern", "Customer Success Associate",
    "Supply Chain Analyst", "Content & Social Media Intern",
    "HR Operations Intern", "UX/UI Design Intern",
]
TEACH_TITLES = [
    "English Teacher - Primary School", "English Teacher - High School",
    "ESL Instructor for Adults", "Kindergarten English Educator",
    "Conversational English Facilitator", "Academic English Tutor",
]

ORGS_VOL = ["Local Volunteer Committee", "Green Future NGO", "Bright Minds Foundation",
            "Ocean Guardians", "EduReach Initiative", "Hope Community Center",
            "Sustainable Roots", "Youth Impact Hub"]
ORGS_TAL = ["Voicari GmbH", "Tata Consultancy Services Ltd.", "NexaSoft Solutions",
            "BlueOcean Ventures", "Meridian Analytics", "Cloudline Technologies",
            "Aurora Digital", "Stellar Commerce", "Pioneer Fintech"]
ORGS_TEACH = ["Sunrise Language Academy", "Global English Institute",
              "Little Scholars School", "BrightPath Education"]

VOL_RESP = [
    "Facilitate interactive workshops for local participants",
    "Design engaging learning materials and activities",
    "Collaborate with a diverse international team of volunteers",
    "Support community outreach and awareness campaigns",
    "Document project impact and collect participant feedback",
    "Mentor local youth and encourage active participation",
    "Organize events and cultural exchange sessions",
]
TAL_RESP = [
    "Build and maintain client relationships and partnerships",
    "Conduct outreach via email, phone, and LinkedIn",
    "Maintain CRM data and document contacts",
    "Support day-to-day operations of the team",
    "Research and qualify new target segments",
    "Contribute to sales and marketing materials",
    "Prepare reports and present metrics to the team",
    "Collaborate cross-functionally on product initiatives",
]
TEACH_RESP = [
    "Plan and deliver engaging English lessons",
    "Assess student progress and provide feedback",
    "Create a supportive and inclusive classroom environment",
    "Prepare teaching materials adapted to different levels",
    "Organize extracurricular language activities",
]

PROG_BENEFITS = [
    "International exposure in a real working environment",
    "Practical, hands-on skill development",
    "Full support during selection and stay",
    "Leadership and personal development opportunities",
    "A global network of peers and mentors",
    "Certificate of completion and reference letter",
]

def money(cur, lo, hi):
    return {"currency": cur, "amount": random.randint(lo, hi) // 10 * 10, "period": "month", "type": "gross"}

def make(idx):
    prog = random.choices(["global-volunteer", "global-talent", "global-teacher"],
                          weights=[60, 30, 10])[0]
    city, country, iso2, lat, lng, region = random.choice(CITIES)
    # jitter coords slightly so markers in same city don't overlap perfectly
    lat += random.uniform(-0.04, 0.04)
    lng += random.uniform(-0.04, 0.04)

    if prog == "global-volunteer":
        title = random.choice(VOL_TITLES)
        org = random.choice(ORGS_VOL)
        dur_weeks = random.choice([6, 8, 12])
        duration = f"{dur_weeks} Weeks"
        resp = random.sample(VOL_RESP, k=random.randint(4, 6))
        salary = None
        cat = "Volunteering"
        min_age, max_age = 18, random.choice([28, 30, 30, 30])
        is_gp = True
    elif prog == "global-talent":
        title = random.choice(TAL_TITLES)
        org = random.choice(ORGS_TAL)
        months = random.choice([3, 6, 12])
        dur_weeks = months * 4
        duration = f"{months} - {months+3 if months<12 else 18} Months"
        resp = random.sample(TAL_RESP, k=random.randint(5, 7))
        cur = {"Europe": "EUR", "Asia": "USD", "Africa": "USD",
               "Americas": "USD"}[region]
        salary = money(cur, 300, 1200)
        cat = "Professional Internship"
        min_age, max_age = 18, 30
        is_gp = False
    else:
        title = random.choice(TEACH_TITLES)
        org = random.choice(ORGS_TEACH)
        months = random.choice([3, 6])
        dur_weeks = months * 4
        duration = f"{months} - {months+3} Months"
        resp = random.sample(TEACH_RESP, k=random.randint(3, 5))
        salary = money("USD", 250, 800)
        cat = "Teaching"
        min_age, max_age = 20, 32
        is_gp = False

    # languages
    reqlangs = [{"name": "English", "level": random.choice(["Intermediate", "Fluent"])}]
    if random.random() < 0.45:
        extra = random.choice([l for l in LANGS if l != "English"])
        reqlangs.append({"name": extra, "level": random.choice(LEVELS[:3])})

    pool = FIELDS_BY_TITLE.get(title, FIELDS)
    fields = random.sample(pool, k=min(len(pool), random.randint(2, 3)))
    n_sdg = random.randint(1, 3)
    sdgs = random.sample(SDGS, k=n_sdg)
    sdg_out = [{"name": s[0], "number": s[1], "color": s[2]} for s in sdgs]

    # start window in 2026
    start_month = random.randint(8, 12)
    open_from = f"2026-{start_month:02d}-01"
    open_to = f"2026-{min(start_month+3,12):02d}-28"
    deadline_month = max(start_month - 1, 7)
    deadline = f"2026-{deadline_month:02d}-{random.randint(10,28):02d}"

    benefits = {
        "accommodation": random.random() < (0.8 if prog != "global-talent" else 0.5),
        "food": random.random() < 0.5,
        "transport": random.random() < 0.4,
        "visaSupport": random.random() < 0.7,
        "stipend": salary is not None,
    }

    desc_map = {
        "global-volunteer": f"Join a purpose-driven volunteering experience in {city}, {country}. Work alongside a passionate local team and international volunteers to create real, measurable impact in the community. This project is part of the Global Volunteer programme, connecting young people to the UN Sustainable Development Goals through hands-on cross-cultural exchange.",
        "global-talent": f"An international professional internship hosted by {org} in {city}, {country}. Gain real corporate experience, develop in-demand skills, and grow your global network. Part of the Global Talent programme, designed to give youth exposure to high-quality professional experiences abroad.",
        "global-teacher": f"Teach English and inspire learners in {city}, {country}. As part of the Global Teacher programme, you will help build language skills and confidence while immersing yourself in a new culture.",
    }

    return {
        "id": 1300000 + idx,
        "url": f"https://opportunities.example.org/{prog}/{1300000+idx}",
        "programme": prog,
        "programmeLabel": {"global-volunteer": "Global Volunteer",
                           "global-talent": "Global Talent",
                           "global-teacher": "Global Teacher"}[prog],
        "category": cat,
        "isPremium": random.random() < 0.05,
        "isGlobalProject": is_gp,
        "title": title,
        "organization": org,
        "location": {"city": city, "country": country, "countryCode": iso2,
                     "region": region, "lat": round(lat, 4), "lng": round(lng, 4)},
        "duration": duration,
        "durationWeeks": dur_weeks,
        "description": desc_map[prog],
        "responsibilities": resp,
        "programBenefits": random.sample(PROG_BENEFITS, k=random.randint(3, 5)),
        "requiredLanguages": reqlangs,
        "fieldsOfStudy": fields,
        "minAge": min_age,
        "maxAge": max_age,
        "salary": salary,
        "benefits": benefits,
        "workSchedule": ("Monday to Friday, 9:00 - 17:00"
                         if prog != "global-volunteer" else "Flexible, ~30 hrs/week"),
        "sdgs": sdg_out,
        "applicants": random.randint(0, 120),
        "openings": random.randint(1, 6),
        "applicationOpenFrom": open_from,
        "applicationOpenTo": open_to,
        "applicationDeadline": deadline,
        "backgroundRequired": random.random() < 0.4,
        "logistics": {
            "airportPickup": random.random() < 0.6,
            "orientationProvided": True,
            "weeklyHours": 40 if prog != "global-volunteer" else 30,
        },
    }

data = [make(i) for i in range(160)]
with open(OUT, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=1)
print("wrote", len(data), "opportunities to", os.path.abspath(OUT))
