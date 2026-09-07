"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Plane,
  MapPin,
  Calendar,
  Wallet,
  Compass,
  Hotel,
  Clock,
  ExternalLink,
  Navigation,
  Sparkles,
  CheckCircle2,
  Loader2,
  ChevronDown,
  Plus,
  Trash2,
  PlaneTakeoff,
  PlaneLanding,
  Smartphone,
  Download,
  FileText,
  Printer,
} from "lucide-react";

const WORLDWIDE_COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Argentina", "Armenia", "Australia", "Austria",
  "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
  "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Canada", "Chile", "China", "Colombia",
  "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Dominican Republic", "Ecuador", "Egypt",
  "Estonia", "Ethiopia", "Fiji", "Finland", "France", "Georgia", "Germany", "Ghana", "Greece", "Guatemala",
  "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan",
  "Jordan", "Kazakhstan", "Kenya", "Kuwait", "Laos", "Latvia", "Lebanon", "Lithuania", "Luxembourg", "Malaysia",
  "Maldives", "Malta", "Mexico", "Monaco", "Mongolia", "Montenegro", "Morocco", "Myanmar", "Nepal", "Netherlands",
  "New Zealand", "Norway", "Oman", "Pakistan", "Panama", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
  "Qatar", "Romania", "Russia", "Saudi Arabia", "Senegal", "Serbia", "Singapore", "Slovakia", "Slovenia", "South Africa",
  "South Korea", "Spain", "Sri Lanka", "Sweden", "Switzerland", "Taiwan", "Tanzania", "Thailand", "Tunisia", "Turkey",
  "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vatican City", "Vietnam", "Zimbabwe"
];

const AIRPORTS_BY_COUNTRY: Record<string, string[]> = {
  Malaysia: [
    "Kuala Lumpur International (KUL)",
    "Penang International (PEN)",
    "Kota Kinabalu International (BKI)",
    "Kuching International (KCH)",
    "Senai International (JHB)",
    "Langkawi International (LGK)"
  ],
  Japan: [
    "Tokyo Narita (NRT)",
    "Tokyo Haneda (HND)",
    "Kansai International (KIX)",
    "Chubu Centrair (NGO)",
    "New Chitose / Sapporo (CTS)",
    "Fukuoka Airport (FUK)"
  ],
  Singapore: [
    "Singapore Changi (SIN)",
    "Seletar Airport (XSP)"
  ],
  Switzerland: [
    "Zurich Airport (ZRH)",
    "Geneva Airport (GVA)",
    "EuroAirport Basel Mulhouse Freiburg (BSL)",
    "Bern Airport (BRN)"
  ],
  "United States": [
    "John F. Kennedy / New York (JFK)",
    "Los Angeles International (LAX)",
    "San Francisco International (SFO)",
    "Chicago O'Hare (ORD)",
    "Miami International (MIA)"
  ],
  "United Kingdom": [
    "London Heathrow (LHR)",
    "London Gatwick (LGW)",
    "Manchester Airport (MAN)",
    "Edinburgh Airport (EDI)"
  ],
  Australia: [
    "Sydney Kingsford Smith (SYD)",
    "Melbourne Airport (MEL)",
    "Brisbane Airport (BNE)",
    "Perth Airport (PER)"
  ],
  Thailand: [
    "Bangkok Suvarnabhumi (BKK)",
    "Don Mueang / Bangkok (DMK)",
    "Phuket International (HKT)",
    "Chiang Mai International (CNX)"
  ],
  Indonesia: [
    "Jakarta Soekarno-Hatta (CGK)",
    "Bali Ngurah Rai (DPS)",
    "Surabaya Juanda (SUB)"
  ],
  "South Korea": [
    "Seoul Incheon (ICN)",
    "Seoul Gimpo (GMP)",
    "Gimhae / Busan (PUS)",
    "Jeju International (CJU)"
  ]
};

const WORLDWIDE_CURRENCIES = [
  "AED - UAE Dirham", "AUD - Australian Dollar", "CAD - Canadian Dollar", "CHF - Swiss Franc",
  "CNY - Chinese Yuan", "EUR - Euro", "GBP - British Pound", "HKD - Hong Kong Dollar",
  "IDR - Indonesian Rupiah", "INR - Indian Rupee", "JPY - Japanese Yen", "KRW - South Korean Won",
  "MYR - Malaysian Ringgit", "NZD - New Zealand Dollar", "PHP - Philippine Peso", "SGD - Singapore Dollar",
  "THB - Thai Baht", "TWD - New Taiwan Dollar", "USD - US Dollar", "VND - Vietnamese Đồng"
];

const HOTEL_SUGGESTIONS: Record<string, string[]> = {
  Tokyo: ["Shinjuku Station Area", "Shibuya Crossing Vicinity", "Tokyo Station / Ginza", "Asakusa / Ueno District"],
  Kyoto: ["Kyoto Station Central", "Gion / Kawaramachi", "Arashiyama Riverside", "Higashiyama District"],
  Osaka: ["Namba / Dotonbori", "Umeda Station Area", "Shin-Osaka Station"],
  Sapporo: ["Sapporo Station Central", "Odori Park Area", "Susukino District"],
  Zurich: ["Old Town (Altstadt)", "Zurich Central Station (HB)", "Lake Zurich Waterfront"],
  Lucerne: ["Lucerne Old Town", "Lake Lucerne Promenade"],
  Singapore: ["Marina Bay Sands Vicinity", "Orchard Road", "Bugis / Kampong Glam"],
  "Kuala Lumpur": ["Bukit Bintang", "KLCC / City Centre", "KL Sentral Station"],
  Penang: ["George Town Heritage Zone", "Batu Ferringhi Beach"],
};

interface TripStop {
  id: string;
  city: string;
  days: number;
  hotelLocation: string;
}

interface Activity {
  time: string;
  title: string;
  cost: string;
  transit_info?: string;
  booking_link?: string;
}

interface DayPlan {
  day: number;
  city?: string;
  title: string;
  recommended_stay?: string;
  activities: Activity[];
}

function SearchableCombobox({
  label,
  value,
  onChange,
  options = [],
  placeholder,
  loading,
  icon: Icon,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder: string;
  loading?: boolean;
  icon: React.ElementType;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const matches = options.filter((opt) =>
    opt.toLowerCase().includes((value || "").toLowerCase())
  );
  const filteredOptions = matches.length > 0 ? matches : options;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative space-y-1.5" ref={containerRef}>
      <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <Icon className="w-3.5 h-3.5 text-blue-400" /> {label}
        </span>
        {loading && <Loader2 className="w-3 h-3 animate-spin text-blue-400" />}
      </label>

      <div className="relative">
        <input
          type="text"
          value={value}
          autoComplete="off"
          onChange={(e) => {
            onChange(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full bg-slate-900/80 border border-slate-700 rounded-xl p-3 pr-8 text-sm text-white focus:border-blue-500 focus:outline-none transition placeholder:text-slate-500 active:bg-slate-900"
        />
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {isOpen && (
        <ul className="absolute z-50 w-full mt-1 max-h-56 overflow-y-auto bg-slate-800 border border-slate-700 rounded-xl shadow-2xl divide-y divide-slate-700/50 text-sm no-scrollbar">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => (
              <li
                key={opt}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange(opt);
                  setIsOpen(false);
                }}
                className="px-3.5 py-3 text-slate-200 hover:bg-blue-600 active:bg-blue-700 hover:text-white cursor-pointer transition flex items-center justify-between"
              >
                <span>{opt}</span>
                {(value || "").toLowerCase() === opt.toLowerCase() && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                )}
              </li>
            ))
          ) : (
            <li className="px-3.5 py-3 text-xs text-slate-400 italic">
              Type to enter custom entry
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

export default function Home() {
  const [countriesList] = useState<string[]>(WORLDWIDE_COUNTRIES);
  const [citiesList, setCitiesList] = useState<string[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);

  const [selectedCountry, setSelectedCountry] = useState("Japan");
  const [currency, setCurrency] = useState("USD - US Dollar");
  const [budget, setBudget] = useState(2500);
  const [interest, setInterest] = useState("Culture & History");

  // Flight Gateways
  const [arrivalGateway, setArrivalGateway] = useState("Tokyo Narita (NRT)");
  const [departureGateway, setDepartureGateway] = useState("Kansai International (KIX)");
  const [arrivalTime, setArrivalTime] = useState("10:00");
  const [departureTime, setDepartureTime] = useState("18:00");

  const airportOptions = AIRPORTS_BY_COUNTRY[selectedCountry] || [
    "Major International Airport (Main)",
    "Secondary Regional Airport",
  ];

  // Multi-Stop State
  const [stops, setStops] = useState<TripStop[]>([
    { id: "1", city: "Tokyo", days: 3, hotelLocation: "Shinjuku Station Area" },
    { id: "2", city: "Kyoto", days: 2, hotelLocation: "Kyoto Station Central" },
  ]);

  const [status, setStatus] = useState<string>("");
  const [itinerary, setItinerary] = useState<DayPlan[]>([]);
  const [activeDayTab, setActiveDayTab] = useState<number>(1);
  const [loading, setLoading] = useState(false);

  // EXPORT SELECTION STATE ("ALL" or specific day number string e.g. "1")
  const [exportSelection, setExportSelection] = useState<string>("ALL");

  const handleCountryChange = (newCountry: string) => {
    setSelectedCountry(newCountry);
    const availableAirports = AIRPORTS_BY_COUNTRY[newCountry] || [
      "Major International Airport (Main)",
      "Secondary Regional Airport",
    ];
    setArrivalGateway(availableAirports[0]);
    setDepartureGateway(availableAirports[availableAirports.length > 1 ? 1 : 0]);
  };

  useEffect(() => {
    if (!selectedCountry) return;
    async function fetchCities() {
      try {
        setLoadingCities(true);
        const res = await fetch("https://countriesnow.space/api/v0.1/countries/cities", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ country: selectedCountry }),
        });
        const data = await res.json();
        if (data.data && data.data.length > 0) {
          setCitiesList(data.data);
        } else {
          setCitiesList([]);
        }
      } catch (err) {
        setCitiesList([]);
      } finally {
        setLoadingCities(false);
      }
    }
    fetchCities();
  }, [selectedCountry]);

  const totalDays = stops.reduce((acc, stop) => acc + (Number(stop.days) || 0), 0);

  const addStop = () => {
    setStops((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        city: "",
        days: 2,
        hotelLocation: "",
      },
    ]);
  };

  const removeStop = (id: string) => {
    if (stops.length === 1) return;
    setStops((prev) => prev.filter((s) => s.id !== id));
  };

  const updateStop = (id: string, field: keyof TripStop, value: any) => {
    setStops((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const updated = { ...s, [field]: value };
          if (field === "city" && HOTEL_SUGGESTIONS[value]) {
            updated.hotelLocation = HOTEL_SUGGESTIONS[value][0];
          }
          return updated;
        }
        return s;
      })
    );
  };

  const format12Hour = (timeStr: string) => {
    if (!timeStr) return "";
    const [hours, minutes] = timeStr.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    return `${String(formattedHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${period}`;
  };

  // HANDLER: DOWNLOAD TXT
  const handleDownloadTxt = () => {
    let content = `======================================\n`;
    content += `TRIP ARCHITECT ITINERARY - ${selectedCountry.toUpperCase()}\n`;
    content += `======================================\n\n`;
    content += `Arrival Gateway: ${arrivalGateway} (${format12Hour(arrivalTime)})\n`;
    content += `Departure Gateway: ${departureGateway} (${format12Hour(departureTime)})\n`;
    content += `Total Duration: ${totalDays} Days\n`;
    content += `Budget: ${budget} ${currency.split(" - ")[0]}\n\n`;

    const daysToExport = exportSelection === "ALL" 
      ? itinerary 
      : itinerary.filter((d) => d.day === Number(exportSelection));

    daysToExport.forEach((dayPlan) => {
      content += `--------------------------------------\n`;
      content += `DAY ${dayPlan.day}: ${dayPlan.title.toUpperCase()}\n`;
      if (dayPlan.recommended_stay) {
        content += `Base Hotel: ${dayPlan.recommended_stay}\n`;
      }
      content += `--------------------------------------\n`;

      dayPlan.activities.forEach((act) => {
        content += `[${act.time}] ${act.title} | Cost: ${act.cost}\n`;
        if (act.transit_info) content += `  Transit: ${act.transit_info}\n`;
        if (act.booking_link) content += `  Link: ${act.booking_link}\n`;
      });
      content += `\n`;
    });

    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = exportSelection === "ALL" 
      ? `${selectedCountry}_Full_Itinerary.txt` 
      : `${selectedCountry}_Day_${exportSelection}_Itinerary.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // HANDLER: PRINT / EXPORT PDF
  const handleExportPdf = () => {
    window.print();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("Processing Open-Jaw Multi-City Route with AI Agent Fleet...");
    setItinerary([]);
    setActiveDayTab(1);

    const selectedCurrencyCode = currency.split(" - ")[0];

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${backendUrl}/api/generate-itinerary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          country: selectedCountry,
          arrival_city_or_airport: arrivalGateway,
          departure_city_or_airport: departureGateway,
          stops: stops.map((s) => ({
            city: s.city,
            days: Number(s.days),
            hotel_location: s.hotelLocation,
          })),
          total_days: totalDays,
          budget: Number(budget),
          currency: selectedCurrencyCode,
          interests: [interest],
          flight_arrival_time: format12Hour(arrivalTime),
          flight_departure_time: format12Hour(departureTime),
        }),
      });

      if (!response.body) return;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);
        const lines = chunkValue.split("\n\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = JSON.parse(line.replace("data: ", ""));
            if (data.status) setStatus(data.status);
            if (data.type === "DAY_PLAN") {
              setItinerary((prev) => [...prev, data.payload]);
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
      setStatus("Network error: ensure FastAPI backend is running on http://localhost:8000");
    } finally {
      setLoading(false);
    }
  };

  const currentDayData = itinerary.find((d) => d.day === activeDayTab) || itinerary[0];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans pb-20">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-blue-600/20 via-indigo-500/10 to-transparent blur-3xl pointer-events-none print:hidden" />

      <main className="relative max-w-5xl mx-auto px-4 py-6 md:py-8 space-y-6 md:space-y-8">
        
        {/* Header */}
        <header className="space-y-3 border-b border-slate-800 pb-5 print:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 p-0.5 shadow-lg shadow-blue-500/30 flex items-center justify-center">
                <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                  <Plane className="w-5 h-5 text-blue-400 -rotate-45" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
                  Trip Architect
                </h1>
                <p className="text-xs text-slate-400 font-medium">Open-Jaw AI Route Planner</p>
              </div>
            </div>

            <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
              <Sparkles className="w-3 h-3" /> PWA Ready
            </div>
          </div>
        </header>

        {/* Mobile Prompt */}
        <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between text-xs text-slate-300 print:hidden">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Mobile Optimized: Tap <strong>"Add to Home Screen"</strong> to test as Native App.</span>
          </div>
        </div>

        {/* Form Controls */}
        <section className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/60 rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl space-y-6 print:hidden">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <SearchableCombobox
                label="Country / Region"
                value={selectedCountry}
                onChange={handleCountryChange}
                options={countriesList}
                placeholder="Search country..."
                icon={MapPin}
              />

              <SearchableCombobox
                label="Currency"
                value={currency}
                onChange={setCurrency}
                options={WORLDWIDE_CURRENCIES}
                placeholder="Search currency..."
                icon={Wallet}
              />

              <div>
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5 mb-1.5">
                  Budget ({currency.split(" - ")[0]})
                </label>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-blue-500 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5 mb-1.5">
                  <Compass className="w-3.5 h-3.5 text-blue-400" /> Focus Area
                </label>
                <select
                  value={interest}
                  onChange={(e) => setInterest(e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-blue-500 focus:outline-none transition"
                >
                  <option value="Culture & History">Culture & History</option>
                  <option value="Foodie / Culinary">Foodie / Culinary</option>
                  <option value="Nature & Scenery">Nature & Scenery</option>
                  <option value="Shopping & Urban">Shopping & Urban</option>
                </select>
              </div>
            </div>

            {/* Flight Gateways */}
            <div className="space-y-4 border-t border-slate-700/50 pt-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plane className="w-4 h-4 text-blue-400" /> Flight Gateways
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/60 border border-slate-700/60 space-y-3">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <PlaneLanding className="w-4 h-4" /> Arrival Logistics
                  </span>
                  <div className="space-y-3">
                    <SearchableCombobox
                      label="Arrival Airport / City"
                      value={arrivalGateway}
                      onChange={setArrivalGateway}
                      options={airportOptions}
                      placeholder="Select or type airport..."
                      icon={PlaneLanding}
                    />
                    <div>
                      <label className="text-xs font-medium text-slate-300 mb-1 block">
                        Arrival Time
                      </label>
                      <input
                        type="time"
                        value={arrivalTime}
                        onChange={(e) => setArrivalTime(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-blue-500 focus:outline-none transition [color-scheme:dark]"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/60 border border-slate-700/60 space-y-3">
                  <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                    <PlaneTakeoff className="w-4 h-4" /> Departure Logistics
                  </span>
                  <div className="space-y-3">
                    <SearchableCombobox
                      label="Departure Airport / City"
                      value={departureGateway}
                      onChange={setDepartureGateway}
                      options={airportOptions}
                      placeholder="Select or type airport..."
                      icon={PlaneTakeoff}
                    />
                    <div>
                      <label className="text-xs font-medium text-slate-300 mb-1 block">
                        Departure Time
                      </label>
                      <input
                        type="time"
                        value={departureTime}
                        onChange={(e) => setDepartureTime(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-blue-500 focus:outline-none transition [color-scheme:dark]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Destinations */}
            <div className="space-y-4 border-t border-slate-700/50 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-blue-400" /> Destinations & Hotels ({totalDays} Days)
                  </h3>
                  <p className="text-xs text-slate-400">Configure stops and stay bases.</p>
                </div>
                <button
                  type="button"
                  onClick={addStop}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-300 text-xs font-semibold hover:bg-blue-600/30 transition active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Stop
                </button>
              </div>

              <div className="space-y-3">
                {stops.map((stop, index) => {
                  const currentCityHotelOptions = HOTEL_SUGGESTIONS[stop.city] || [
                    "City Centre",
                    "Main Station Area",
                    "Downtown / Financial District",
                    "Old Town / Historic Area",
                  ];

                  return (
                    <div
                      key={stop.id}
                      className="p-3.5 sm:p-4 rounded-xl bg-slate-900/60 border border-slate-700/60 space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="text-xs font-bold text-indigo-400">
                          Stop #{index + 1}
                        </span>
                        {stops.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeStop(stop.id)}
                            className="text-slate-400 hover:text-red-400 transition p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <SearchableCombobox
                          label="City / Destination"
                          value={stop.city}
                          onChange={(val) => updateStop(stop.id, "city", val)}
                          options={
                            citiesList.length > 0
                              ? citiesList
                              : ["Tokyo", "Kyoto", "Osaka", "Sapporo", "Zurich", "Lucerne", "Singapore"]
                          }
                          placeholder="Select or type city..."
                          loading={loadingCities}
                          icon={Navigation}
                        />

                        <div>
                          <label className="text-xs font-medium text-slate-300 flex items-center gap-1 mb-1.5">
                            <Calendar className="w-3.5 h-3.5 text-blue-400" /> Duration (Days)
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={15}
                            value={stop.days}
                            onChange={(e) => updateStop(stop.id, "days", Number(e.target.value))}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-blue-500 focus:outline-none transition"
                          />
                        </div>

                        <SearchableCombobox
                          label="Hotel / Stay Zone"
                          value={stop.hotelLocation}
                          onChange={(val) => updateStop(stop.id, "hotelLocation", val)}
                          options={currentCityHotelOptions}
                          placeholder="Hotel name or area..."
                          icon={Hotel}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-xl shadow-blue-600/25 transition-all active:scale-[0.98] disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  Generating Route...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Generate Open-Jaw Itinerary
                </>
              )}
            </button>
          </form>
        </section>

        {/* Streaming Status */}
        {status && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs sm:text-sm animate-pulse print:hidden">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-ping shrink-0" />
            <span><strong>Agent Status:</strong> {status}</span>
          </div>
        )}

        {/* EXPORT TOOLBAR WITH SELECTION CONTROL */}
        {itinerary.length > 0 && (
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-800/90 border border-blue-500/30 shadow-xl print:hidden">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Download className="w-4 h-4 text-emerald-400" /> Export Itinerary
                </h3>
                <p className="text-xs text-slate-400">Choose all days or a single day to export.</p>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                {/* Export Scope Selector */}
                <select
                  value={exportSelection}
                  onChange={(e) => setExportSelection(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="ALL">All Days (Full Itinerary)</option>
                  {itinerary.map((d) => (
                    <option key={d.day} value={d.day}>
                      Day {d.day} Only {d.city ? `(${d.city})` : ""}
                    </option>
                  ))}
                </select>

                {/* Download TXT Button */}
                <button
                  type="button"
                  onClick={handleDownloadTxt}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 active:bg-slate-800 text-slate-200 text-xs font-semibold transition border border-slate-600 shadow-md"
                >
                  <FileText className="w-4 h-4 text-blue-400" /> Download TXT
                </button>

                {/* Print / PDF Button */}
                <button
                  type="button"
                  onClick={handleExportPdf}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-semibold transition shadow-lg shadow-emerald-600/25"
                >
                  <Printer className="w-4 h-4" /> Print / PDF
                </button>
              </div>
            </div>

            {/* Days Tabs (Screen Only) */}
            <div className="flex gap-2 border-b border-slate-800 pb-2 overflow-x-auto no-scrollbar print:hidden">
              {itinerary.map((d) => (
                <button
                  key={d.day}
                  onClick={() => setActiveDayTab(d.day)}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap flex items-center gap-1.5 ${
                    activeDayTab === d.day
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                      : "bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  }`}
                >
                  <span>Day {d.day}</span>
                  {d.city && <span className="text-[10px] opacity-75">({d.city})</span>}
                </button>
              ))}
            </div>

            {/* SCREEN VIEW: Active Day Tab Display */}
            {currentDayData && (
              <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-4 sm:p-6 shadow-xl space-y-5 print:hidden">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-700/60 pb-3">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-lg bg-blue-500/20 text-blue-400 text-xs font-bold">
                        Day {currentDayData.day}
                      </span>
                      {currentDayData.title}
                    </h2>
                    {currentDayData.recommended_stay && (
                      <p className="text-xs text-indigo-300 font-medium mt-1 flex items-center gap-1">
                        <Hotel className="w-3.5 h-3.5 text-indigo-400" /> Base Hotel: {currentDayData.recommended_stay}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  {currentDayData.activities.map((act, idx) => (
                    <div
                      key={idx}
                      className="group relative pl-5 border-l-2 border-slate-700 hover:border-blue-500 transition-colors space-y-2 py-1"
                    >
                      <div className="absolute -left-[7px] top-2 w-3 h-3 rounded-full bg-slate-900 border-2 border-slate-500 group-hover:border-blue-500 group-hover:bg-blue-500 transition-colors" />

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        <div className="flex items-center gap-2.5">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-400 bg-blue-950/60 border border-blue-800/50 px-2 py-0.5 rounded-md">
                            <Clock className="w-3 h-3" /> {act.time}
                          </span>
                          <h3 className="text-xs sm:text-sm font-semibold text-slate-100 group-hover:text-white transition">
                            {act.title}
                          </h3>
                        </div>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-700/50 self-start sm:self-auto">
                          {act.cost}
                        </span>
                      </div>

                      {act.transit_info && (
                        <p className="text-xs text-slate-400 flex items-center gap-1.5 pl-0.5">
                          <Navigation className="w-3 h-3 text-slate-500 shrink-0" />
                          <span><strong>Transit:</strong> {act.transit_info}</span>
                        </p>
                      )}

                      {act.booking_link && (
                        <div className="pt-1">
                          <a
                            href={act.booking_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-medium text-blue-400 hover:text-blue-300 hover:underline"
                          >
                            <span>Reserve / Location</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PRINT / PDF CONTAINER (Hidden on screen, active on Print based on exportSelection) */}
            <div className="hidden print:block space-y-8">
              <div className="border-b border-black pb-4 mb-6">
                <h1 className="text-2xl font-bold uppercase tracking-wide">
                  Trip Itinerary: {selectedCountry}
                </h1>
                <p className="text-xs mt-1">
                  <strong>Arrival:</strong> {arrivalGateway} ({format12Hour(arrivalTime)}) |{" "}
                  <strong>Departure:</strong> {departureGateway} ({format12Hour(departureTime)})
                </p>
                <p className="text-xs">
                  <strong>Duration:</strong> {totalDays} Days | <strong>Budget:</strong> {budget} {currency.split(" - ")[0]}
                </p>
              </div>

              {itinerary.map((dayPlan) => {
                const shouldDisplayInPrint =
                  exportSelection === "ALL" || exportSelection === String(dayPlan.day);

                if (!shouldDisplayInPrint) return null;

                return (
                  <div key={dayPlan.day} className="print-page-break space-y-4 pb-6">
                    <div className="border-b border-slate-400 pb-2">
                      <h2 className="text-lg font-bold">
                        Day {dayPlan.day}: {dayPlan.title}
                      </h2>
                      {dayPlan.recommended_stay && (
                        <p className="text-xs italic text-slate-700">
                          Base Hotel: {dayPlan.recommended_stay}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3">
                      {dayPlan.activities.map((act, i) => (
                        <div key={i} className="text-xs border-l-2 border-slate-300 pl-3 py-1 space-y-0.5">
                          <div className="flex justify-between font-bold">
                            <span>[{act.time}] {act.title}</span>
                            <span>{act.cost}</span>
                          </div>
                          {act.transit_info && (
                            <p className="text-slate-600">Transit: {act.transit_info}</p>
                          )}
                          {act.booking_link && (
                            <p className="text-slate-500">Link: {act.booking_link}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}