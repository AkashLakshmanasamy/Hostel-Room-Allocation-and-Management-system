import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../../config";
import "../../styles/Schedule.css";

const API_BASE = `${API_BASE_URL}/api/menu`;

const MealIcon = ({ type }) => {
  const icons = { Morning: '☕', Breakfast: '🍳', Lunch: '🍱', Evening: '🍵', Dinner: '🍽️' };
  return <span className="meal-icon">{icons[type]}</span>;
};

export default function Schedule() {
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [weeklyMenu, setWeeklyMenu] = useState(null);
  const [loading, setLoading] = useState(true);

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  useEffect(() => {
    fetchWeeklyMenu();
  }, []);

  const fetchWeeklyMenu = async () => {
    try {
      const res = await fetch(API_BASE);
      const data = await res.json();

      const formattedMenu = {};
      data.forEach(item => {
        formattedMenu[item.day] = {
          morning: item.morning ? item.morning.split(',').map(s => s.trim()) : [],
          breakfast: item.breakfast || "Not Available",
          lunch: item.lunch || "Not Available",
          evening: item.evening ? item.evening.split(',').map(s => s.trim()) : [],
          dinner: item.dinner || "Not Available"
        };
      });
      setWeeklyMenu(formattedMenu);
    } catch (error) {
      console.error("Error fetching menu:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="schedule-page"><div className="loader">Loading Menu...</div></div>;
  if (!weeklyMenu || !weeklyMenu[selectedDay]) return <div className="schedule-page">Menu data not found.</div>;

  return (
    <div className="schedule-page">
      <div className="schedule-card">
        <div className="schedule-header">
          <h2>Weekly Food Menu</h2>
          <p>Delicious Tamil Nadu vegetarian meals prepared daily.</p>
        </div>

        <div className="days-selector">
          {daysOfWeek.map(day => (
            <button key={day} className={`day-btn ${selectedDay === day ? 'active' : ''}`} onClick={() => setSelectedDay(day)}>
              {day.substring(0, 3)} <span className="full-day-name">{day.substring(3)}</span>
            </button>
          ))}
        </div>

        <div className="menu-content">
          <h3 className="day-heading">{selectedDay}'s Menu</h3>
          <div className="timeline-container">
            {['Morning', 'Breakfast', 'Lunch', 'Evening', 'Dinner'].map((meal) => (
              <div className="meal-card" key={meal}>
                <div className="meal-header">
                  <div className="meal-title">
                    <MealIcon type={meal} />
                    <span>{meal === 'Morning' || meal === 'Evening' ? `${meal} Beverages` : meal}</span>
                  </div>
                </div>
                {Array.isArray(weeklyMenu[selectedDay][meal.toLowerCase()]) ? (
                  <div className="meal-items-tags">
                    {weeklyMenu[selectedDay][meal.toLowerCase()].map((item, i) => (
                      <span key={i} className="food-tag">{item}</span>
                    ))}
                  </div>
                ) : (
                  <p className="meal-description">{weeklyMenu[selectedDay][meal.toLowerCase()]}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}