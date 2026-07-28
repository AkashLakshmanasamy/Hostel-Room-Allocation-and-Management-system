const db = require('./db');

const seed = async () => {
  try {
    console.log("Seeding weekly_menu...");
    await db.query("DELETE FROM public.weekly_menu");
    const menuItems = [
      ["Monday", "Tea/Milk", "Idly, Sambar, Coconut Chutney", "Veg Biryani, Raita, Curd", "Tea, Veg Samosa", "Chappathi, Paneer Kurma"],
      ["Tuesday", "Coffee/Milk", "Ven Pongal, Medu Vada, Sambar", "Rice, Drumstick Sambar, Beetroot Poriyal", "Tea, Onion Bajji", "Dosa, Tomato Chutney, Sambar"],
      ["Wednesday", "Tea/Milk", "Poori, Potato Masala, Coconut Chutney", "Jeera Rice, Non-Veg Gravy / Paneer Gravy", "Tea, Cream Cake", "Egg Fried Rice / Veg Fried Rice, Gobi Manchurian"],
      ["Thursday", "Coffee/Milk", "Rava Kichadi, Sambar, Chutney", "Lemon Rice, Curd Rice, Potato Fry", "Tea, Sweet Sundal", "Parotta, Salna / Veg Kurma"],
      ["Friday", "Tea/Milk", "Idly, Sambar, Onion Chutney", "Rice, Karakuzhambu, Cabbage Poriyal, Appalam", "Tea, Egg Puffs / Veg Puffs", "Chappathi, Dal Fry, Potato Masala"],
      ["Saturday", "Coffee/Milk", "Puttu, Banana, Kadala Curry", "Sambar Rice, Curd Rice, Potato Chips", "Tea, Butter Biscuits", "Naan, Butter Paneer Masala"],
      ["Sunday", "Tea/Milk", "Dosa, Sambar, Mint Chutney", "Special Chicken Biryani, Raita / Veg Biryani", "Tea, Onion Pakoda", "Idiyappam, Coconut Milk / Kurma"]
    ];

    for (const item of menuItems) {
      await db.query(
        "INSERT INTO public.weekly_menu (day, morning, breakfast, lunch, evening, dinner) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (day) DO UPDATE SET morning = EXCLUDED.morning, breakfast = EXCLUDED.breakfast, lunch = EXCLUDED.lunch, evening = EXCLUDED.evening, dinner = EXCLUDED.dinner",
        item
      );
    }

    console.log("Seeding announcements...");
    await db.query("DELETE FROM public.announcements");
    const announcements = [
      ["Hostel Reopening Notice", "All students are requested to return to the hostels on or before July 30th. Please bring your signed undertaking forms and fee receipts for check-in verification."],
      ["Mess Fee Deadline Extended", "The last date for paying the hostel mess fees for the current semester has been extended to August 10th. Avoid late fees by paying through the online portal."],
      ["Hostel Sports Meet 2026", "Registration is open for the annual Inter-Hostel Volleyball and Cricket tournaments. Interested students can sign up at the hostel office before this Saturday."]
    ];

    for (const ann of announcements) {
      await db.query(
        "INSERT INTO public.announcements (title, content) VALUES ($1, $2)",
        ann
      );
    }

    console.log("Seeding hostel_rules...");
    const generalRules = [
      "Students must maintain silence during study hours (8:30 PM - 10:30 PM).",
      "Attendance is mandatory and will be taken daily at 9:00 PM by the residential wardens.",
      "Prior written permission from the Warden is mandatory for leave or outstation travel.",
      "Cleanliness of rooms, bathrooms, and corridors must be maintained at all times."
    ];
    const messTimings = {
      breakfast: "07:30 AM - 09:00 AM",
      lunch: "12:30 PM - 02:00 PM",
      snacks: "04:30 PM - 05:30 PM",
      dinner: "07:30 PM - 09:00 PM"
    };
    const gateTimings = {
      opening: "06:00 AM",
      curfew_regular: "06:30 PM"
    };
    const prohibitedItems = {
      electrical: ["Iron Box", "Electric Kettle", "Induction Stove", "Room Heater"],
      restricted: ["Weapons", "Tobacco Products", "Alcoholic Beverages", "Flammable Liquids"]
    };
    const consequences = [
      { infraction: "Late entry past curfew without prior permissions", penalty: "Written warning and parents notification" },
      { infraction: "Possession or usage of prohibited electrical appliances", penalty: "Fine of Rs. 1000 and confiscation of appliance" },
      { infraction: "Damage to hostel property or general vandalism", penalty: "Actual repair costs recovery and suspension" }
    ];

    await db.query(
      `INSERT INTO public.hostel_rules (id, general_rules, mess_timings, gate_timings, prohibited_items, consequences)
       VALUES (1, $1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE SET
         general_rules = EXCLUDED.general_rules,
         mess_timings = EXCLUDED.mess_timings,
         gate_timings = EXCLUDED.gate_timings,
         prohibited_items = EXCLUDED.prohibited_items,
         consequences = EXCLUDED.consequences`,
      [
        JSON.stringify(generalRules),
        JSON.stringify(messTimings),
        JSON.stringify(gateTimings),
        JSON.stringify(prohibitedItems),
        JSON.stringify(consequences)
      ]
    );

    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err.message);
    process.exit(1);
  }
};

seed();
