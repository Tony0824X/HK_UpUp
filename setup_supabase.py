"""
Script to set up Supabase for HK_UpUp:
1. Create storage bucket for posters
2. Upload poster images
3. Create competitions table
4. Insert competition data from Excel
"""

import requests
import json
import os
from datetime import datetime

# Supabase config
SUPABASE_URL = "https://gbeqztmruwaigwphftlw.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiZXF6dG1ydXdhaWd3cGhmdGx3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzE1MjYxMCwiZXhwIjoyMDkyNzI4NjEwfQ.zwoiLioFlrfXAlxqz0fanXth8S7jKKg4fimw-b4X0g0"

HEADERS = {
    "apikey": SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
}

POSTERS_DIR = "/Users/a1234/Desktop/HK_UpUp/posters"

# ============================================================
# Step 1: Create storage bucket for posters
# ============================================================
def create_storage_bucket():
    print("=== Step 1: Creating storage bucket 'posters' ===")
    url = f"{SUPABASE_URL}/storage/v1/bucket"
    payload = {
        "id": "posters",
        "name": "posters",
        "public": True,  # Public so poster images can be accessed via URL
    }
    resp = requests.post(url, headers={**HEADERS, "Content-Type": "application/json"}, json=payload)
    if resp.status_code == 200:
        print("  ✅ Bucket 'posters' created successfully")
    elif resp.status_code == 409:
        print("  ⚠️  Bucket 'posters' already exists, skipping")
    else:
        print(f"  ❌ Error: {resp.status_code} - {resp.text}")
    return resp.status_code in [200, 409]


# ============================================================
# Step 2: Upload poster images
# ============================================================
def upload_posters():
    print("\n=== Step 2: Uploading poster images ===")
    # Map: image filename -> competition slug for readable URLs
    image_map = {
        "image1.png": "cross-strait-it-competition-2026.png",
        "image2.png": "ushine-case-competition-2026.png",
        "image3.png": "alipayhk-advice-ux-competition-2026.png",
    }

    poster_urls = {}
    for original, slug in image_map.items():
        filepath = os.path.join(POSTERS_DIR, original)
        if not os.path.exists(filepath):
            print(f"  ❌ File not found: {filepath}")
            continue

        with open(filepath, "rb") as f:
            file_data = f.read()

        url = f"{SUPABASE_URL}/storage/v1/object/posters/{slug}"
        resp = requests.post(
            url,
            headers={
                **HEADERS,
                "Content-Type": "image/png",
                "x-upsert": "true",  # Overwrite if exists
            },
            data=file_data,
        )

        if resp.status_code in [200, 201]:
            public_url = f"{SUPABASE_URL}/storage/v1/object/public/posters/{slug}"
            poster_urls[original] = public_url
            print(f"  ✅ Uploaded {original} -> {slug}")
            print(f"     URL: {public_url}")
        else:
            print(f"  ❌ Error uploading {original}: {resp.status_code} - {resp.text}")

    return poster_urls


# ============================================================
# Step 3: Create competitions table via SQL
# ============================================================
def create_table():
    print("\n=== Step 3: Creating 'competitions' table ===")

    # Use the SQL endpoint (pg REST doesn't support DDL, use the SQL API)
    sql = """
    CREATE TABLE IF NOT EXISTS competitions (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        title TEXT NOT NULL,
        organizer TEXT NOT NULL,
        registration_deadline DATE,
        tags TEXT[] DEFAULT '{}',
        prizes TEXT,
        official_url TEXT,
        poster_url TEXT,
        status TEXT DEFAULT 'open' CHECK (status IN ('upcoming', 'open', 'closed', 'ended')),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Enable Row Level Security
    ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;

    -- Allow public read access (anyone can view competitions)
    CREATE POLICY IF NOT EXISTS "Public read access" ON competitions
        FOR SELECT USING (true);

    -- Allow service role full access (for admin operations)
    CREATE POLICY IF NOT EXISTS "Service role full access" ON competitions
        FOR ALL USING (auth.role() = 'service_role');
    """

    # Supabase SQL endpoint
    url = f"{SUPABASE_URL}/rest/v1/rpc/exec_sql"

    # Try using the pg-meta API instead
    url = f"{SUPABASE_URL}/pg/query"
    resp = requests.post(
        url,
        headers={
            **HEADERS,
            "Content-Type": "application/json",
        },
        json={"query": sql},
    )

    if resp.status_code == 200:
        print("  ✅ Table 'competitions' created successfully")
        return True
    else:
        print(f"  ⚠️  pg/query returned {resp.status_code}, trying alternative method...")

        # Alternative: use the raw SQL via the management API
        # Let's try creating via REST API by inserting directly
        # First check if table exists
        check_url = f"{SUPABASE_URL}/rest/v1/competitions?select=id&limit=1"
        check_resp = requests.get(check_url, headers=HEADERS)
        if check_resp.status_code == 200:
            print("  ✅ Table 'competitions' already exists")
            return True
        else:
            print(f"  ❌ Table doesn't exist and couldn't create it automatically.")
            print(f"  📋 Please run this SQL in Supabase Dashboard -> SQL Editor:")
            print()
            print(sql)
            return False


# ============================================================
# Step 4: Insert competition data
# ============================================================
def insert_competitions(poster_urls):
    print("\n=== Step 4: Inserting competition data ===")

    competitions = [
        {
            "title": "Cross-strait with Hong Kong and Macau University Students' Innovation IT Project Competition 2026",
            "organizer": "Guangdong Province Federation of Computers (廣東省計算機學會), co-organized by iProA (HK)",
            "registration_deadline": "2026-05-25",
            "tags": ["Innovation", "IT", "AI"],
            "prizes": "Certification",
            "official_url": "https://panpearl.iproa.org/web/",
            "poster_url": poster_urls.get("image1.png", ""),
            "status": "open",
        },
        {
            "title": "USHINE Case Competition 2026",
            "organizer": "Deloitte",
            "registration_deadline": "2026-05-25",
            "tags": ["Case Competition"],
            "prizes": "HKD$10,000 cash prize, fast-tracked interviews, Certification",
            "official_url": "https://survey.deloitte.com.cn/vm/QxeU4Y.aspx",
            "poster_url": poster_urls.get("image2.png", ""),
            "status": "open",
        },
        {
            "title": "AlipayHK \"Advice\" – Youth Tech Innovation and UX Design Competition & Internship Program 2026",
            "organizer": "AlipayHK, SEED Foundation, The Hong Kong Federation of Youth Groups",
            "registration_deadline": "2026-04-20",
            "tags": ["Innovation", "UX Design"],
            "prizes": "Certification, Internship opportunity at AlipayHK",
            "official_url": "https://alipayhkadvice.seedfoundation.hk/uni/en/",
            "poster_url": poster_urls.get("image3.png", ""),
            "status": "closed",
        },
    ]

    url = f"{SUPABASE_URL}/rest/v1/competitions"
    resp = requests.post(
        url,
        headers={
            **HEADERS,
            "Content-Type": "application/json",
            "Prefer": "return=representation",
        },
        json=competitions,
    )

    if resp.status_code in [200, 201]:
        data = resp.json()
        print(f"  ✅ Inserted {len(data)} competitions successfully!")
        for comp in data:
            print(f"     - {comp['title'][:60]}... (id: {comp['id']})")
        return True
    else:
        print(f"  ❌ Error: {resp.status_code} - {resp.text}")
        return False


# ============================================================
# Main
# ============================================================
if __name__ == "__main__":
    print("🚀 HK_UpUp - Supabase Setup Script\n")

    # Step 1: Create bucket
    if not create_storage_bucket():
        print("Failed to create bucket, exiting.")
        exit(1)

    # Step 2: Upload posters
    poster_urls = upload_posters()
    if not poster_urls:
        print("⚠️  No posters uploaded, continuing without poster URLs...")
        poster_urls = {}

    # Step 3: Create table
    table_created = create_table()

    # Step 4: Insert data (only if table exists)
    if table_created:
        insert_competitions(poster_urls)
    else:
        print("\n⚠️  Please create the table manually first (SQL provided above),")
        print("    then re-run this script.")

    print("\n✨ Done!")
