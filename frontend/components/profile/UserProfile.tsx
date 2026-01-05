"use client";
import React, { useState, useRef, ChangeEvent } from "react";
import { Card, CardContent, CardHeader, Button, TextField, Tabs, Tab, Avatar, Typography, Box } from "@mui/material";
import { User, Sparkles, BookOpen, Calculator } from "lucide-react";
import axios from "axios";

interface UserProfile {
  name: string;
  email: string;
  birthDate: string;
  birthTime: string;
  birthLocation: string;
  hdType: string;
  hdStrategy: string;
  hdAuthority: string;
  profile: string;
  bio: string;
  joinDate: string;
  avatar?: string;
  street?: string;
  zip?: string;
  city?: string;
  country?: string;
  phone?: string;
  gender?: string;
  interests?: string;
  hobbies?: string;
  favoriteFood?: string;
  pets?: string;
  favoriteMusic?: string;
  favoriteBook?: string;
  favoriteMovie?: string;
  relationshipStatus?: string;
  children?: string;
  petName?: string;
  motivation?: string;
  quote?: string;
  website?: string;
  birthday?: string;
  zodiac?: string;
  social?: string;
  job?: string;
  favoriteColor?: string;
  password?: string;
}

const UserProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "Max Mustermann",
    email: "max@mustermann.de",
    birthDate: "1990-01-01",
    birthTime: "12:00",
    birthLocation: "Berlin",
    hdType: "Generator",
    hdStrategy: "Antworten",
    hdAuthority: "Sakral",
    profile: "5/1",
    bio: "Ich bin ein Beispiel-Nutzer für Human Design.",
    joinDate: "2023-01-01",
    avatar: "",
    street: "Musterstraße 1",
    zip: "12345",
    city: "Berlin",
    country: "Deutschland",
    phone: "+49 123 456789",
    gender: "männlich",
    interests: "Lesen, Yoga, Musik",
    hobbies: "Wandern, Kochen, Reisen",
    favoriteFood: "Pizza",
    pets: "Hund",
    favoriteMusic: "Jazz",
    favoriteBook: "Der Alchimist",
    favoriteMovie: "Inception",
    relationshipStatus: "Single",
    children: "Keine",
    petName: "Bello",
    motivation: "Immer neugierig bleiben!",
    quote: "Der Weg ist das Ziel.",
    website: "https://maxmustermann.de",
    birthday: "1990-01-01",
    zodiac: "Steinbock",
    social: "@maxmustermann",
    job: "Softwareentwickler",
    favoriteColor: "Blau",
    password: "",
  });
  const [editedProfile, setEditedProfile] = useState(userProfile);
  const [chartResult, setChartResult] = useState<string>("");
  const [chartLoading, setChartLoading] = useState(false);
  const [tab, setTab] = useState<"profile" | "humandesign" | "chart-creator">("profile");

  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !userProfile) return;
    const file = e.target.files[0];
    if (typeof window !== 'undefined') {
      setAvatarPreview(URL.createObjectURL(file));
    }
    const formData = new FormData();
    formData.append("avatar", file);
    try {
      const userId = typeof window !== 'undefined' ? localStorage.getItem("userId") : null;
      if (!userId) return;
      const res = await axios.post(`/api/user/${userId}/avatar`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUserProfile((prev) => ({ ...prev, avatar: res.data.avatar }));
    } catch {
      alert("Fehler beim Hochladen des Profilbilds");
    }
  };

  // Removed unused handleEdit function
  const handleSave = async () => {
    try {
      const userId = typeof window !== 'undefined' ? localStorage.getItem("userId") : null;
      if (!userId) throw new Error("Keine User-ID gefunden!");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? window.location.origin : '');
      await axios.put(`${apiUrl}/user/${userId}`, {
        ...editedProfile,
      });
      setUserProfile(editedProfile);
      setEditedProfile(editedProfile);
      setIsEditing(false);
    } catch (err) {
      console.error("Fehler beim Speichern:", err);
      alert("Fehler beim Speichern!");
    }
  };
  const handleCancel = () => {
    setEditedProfile(userProfile);
    setIsEditing(false);
  };
  const handleChartCalculation = async () => {
    setChartLoading(true);
    setChartResult("");
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? window.location.origin : '');
      const res = await axios.post(`${apiUrl}/chart/calculate`, {
        userId: "demoUserId123",
        name: userProfile.name,
        birthdate: userProfile.birthDate,
        birthplace: userProfile.birthLocation,
      });
      
      if (res.status >= 200 && res.status < 300 && res.data) {
        setChartResult(res.data.interpretation || res.data.message || "Chart berechnet.");
      } else {
        throw new Error(`Unerwarteter Status: ${res.status}`);
      }
    } catch (err) {
      console.error("Fehler bei der Chartberechnung:", err);
      const errorMessage = err instanceof Error ? err.message : "Fehler bei der Chartberechnung.";
      setChartResult(errorMessage);
    } finally {
      setChartLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", py: 6, px: { xs: 1, sm: 4 }, background: 'linear-gradient(120deg,#2a174d 0%,#3a2069 100%)', borderRadius: 3, boxShadow: "0 6px 32px rgba(44,24,77,0.12)", border: "1px solid #b39ddb" }}>
      <Box sx={{ textAlign: "center", mb: 5, pb: 2, borderBottom: "2px solid #b39ddb" }}>
  <Typography variant="h2" fontWeight={900} sx={{ color: "#fff", textShadow: "0 2px 8px #b39ddb", mb: 1 }}>
          {userProfile.name}
        </Typography>
  <Typography variant="subtitle1" sx={{ color: "#d1c4e9", mb: 2 }}>
          <Sparkles style={{ marginRight: 8, color: "#eab308", verticalAlign: "middle" }} /> Dein Profil
        </Typography>
  <Typography variant="body2" sx={{ color: "#b39ddb", mb: 2 }}>
          Verwalte deine Human Design Informationen und persönlichen Daten
        </Typography>
      </Box>
  <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 4, '& .MuiTabs-indicator': { background: 'linear-gradient(90deg, #b39ddb 0%, #7c4dff 100%)' }, '& .MuiTab-root': { minWidth: 120, color: '#b39ddb', fontWeight: 700 } }}>
  <Tab icon={<User />} label="Persönliche Daten" value="profile" sx={{ color: '#fff' }} />
  <Tab icon={<Sparkles />} label="Human Design" value="humandesign" sx={{ color: '#fff' }} />
        <Tab icon={<BookOpen />} label="Chart" value="chart-creator" sx={{ color: tab === "chart-creator" ? "#1565c0" : "#23233a" }} />
      </Tabs>
      {tab === "profile" && (
  <Card sx={{ p: 2, mb: 2, background: 'rgba(44,24,77,0.85)', color: '#fff', borderRadius: 2, boxShadow: '0 2px 8px rgba(44,24,77,0.12)' }}>
          <Box>
            <Typography variant="h6" sx={{ mb: 1 }}>Profil</Typography>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mr: 2 }}>
                <Avatar sx={{ width: 80, height: 80, mb: 1, boxShadow: "0 2px 8px #b39ddb", border: "2px solid #b39ddb" }} src={avatarPreview || userProfile.avatar || undefined} />
                <Typography variant="subtitle1" sx={{ mt: 0.5, fontWeight: 700 }}>{userProfile.hdType}</Typography>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 500 }}>{userProfile.profile}</Typography>
              </Box>
              <Button variant="contained" component="label" sx={{ ml: 2, background: 'linear-gradient(90deg,#7c4dff 60%,#b39ddb 100%)', color: '#fff', fontWeight: 700, borderRadius: 2 }}>
                Profilbild ändern
                <input type="file" hidden accept="image/*" ref={fileInputRef} onChange={handleAvatarChange} />
              </Button>
            </Box>
            <Box sx={{ mt: 2 }}>
              <Box sx={{ borderTop: "1px solid #e0c3fc", pt: 2, mt: 2 }}>
                <Typography sx={{ fontWeight: 700, mb: 1, color: "#7c3aed" }}>Bio</Typography>
                {isEditing ? (
                  <>
                    <TextField
                      value={editedProfile.bio}
                      onChange={e => setEditedProfile(prev => ({ ...prev, bio: e.target.value }))}
                      multiline
                      rows={3}
                      fullWidth
                      sx={{ mb: 2 }}
                    />
                    <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                      <Button 
                        variant="contained" 
                        onClick={handleSave}
                        sx={{ 
                          background: 'linear-gradient(90deg,#7c4dff 60%,#b39ddb 100%)', 
                          color: '#fff', 
                          fontWeight: 700,
                          borderRadius: 2
                        }}
                      >
                        Speichern
                      </Button>
                      <Button 
                        variant="outlined" 
                        onClick={handleCancel}
                        sx={{ 
                          borderColor: '#b39ddb', 
                          color: '#b39ddb', 
                          fontWeight: 700,
                          borderRadius: 2
                        }}
                      >
                        Abbrechen
                      </Button>
                    </Box>
                  </>
                ) : (
                  <>
                    <Typography variant="body2" sx={{ color: "#23233a", fontStyle: "italic", mb: 2 }}>
                      {userProfile.bio || "Noch keine Bio hinterlegt."}
                    </Typography>
                    <Button 
                      variant="outlined" 
                      onClick={() => setIsEditing(true)}
                      sx={{ 
                        borderColor: '#b39ddb', 
                        color: '#b39ddb', 
                        fontWeight: 700,
                        borderRadius: 2
                      }}
                    >
                      Bearbeiten
                    </Button>
                  </>
                )}
              </Box>
              <Box sx={{ borderTop: "1px solid #e0c3fc", pt: 2, mt: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, color: "#e91e63", fontWeight: 700 }}>Über mich</Typography>
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 1, bgcolor: 'rgba(179,157,219,0.08)', borderRadius: 1.5, p: 2 }}>
                  <Typography color="text.secondary">Lieblingsessen:</Typography>
                  <Typography sx={{ fontWeight: 500 }}>{userProfile.favoriteFood || "-"}</Typography>
                  <Typography color="text.secondary">Haustiere:</Typography>
                  <Typography sx={{ fontWeight: 500 }}>{userProfile.pets || "-"}</Typography>
                  <Typography color="text.secondary">Lieblingsmusik:</Typography>
                  <Typography sx={{ fontWeight: 500 }}>{userProfile.favoriteMusic || "-"}</Typography>
                  <Typography color="text.secondary">Lieblingsbuch:</Typography>
                  <Typography sx={{ fontWeight: 500 }}>{userProfile.favoriteBook || "-"}</Typography>
                  <Typography color="text.secondary">Lieblingsfilm:</Typography>
                  <Typography sx={{ fontWeight: 500 }}>{userProfile.favoriteMovie || "-"}</Typography>
                  <Typography color="text.secondary">Beziehungsstatus:</Typography>
                  <Typography sx={{ fontWeight: 500 }}>{userProfile.relationshipStatus || "-"}</Typography>
                  <Typography color="text.secondary">Kinder:</Typography>
                  <Typography sx={{ fontWeight: 500 }}>{userProfile.children || "-"}</Typography>
                  <Typography color="text.secondary">Haustiername:</Typography>
                  <Typography sx={{ fontWeight: 500 }}>{userProfile.petName || "-"}</Typography>
                  <Typography color="text.secondary">Motivation:</Typography>
                  <Typography sx={{ fontWeight: 500 }}>{userProfile.motivation || "-"}</Typography>
                  <Typography color="text.secondary">Zitat:</Typography>
                  <Typography sx={{ fontWeight: 500 }}>{userProfile.quote || "-"}</Typography>
                  <Typography color="text.secondary">Geburtstag:</Typography>
                  <Typography sx={{ fontWeight: 500 }}>{userProfile.birthday || "-"}</Typography>
                  <Typography color="text.secondary">Sternzeichen:</Typography>
                  <Typography sx={{ fontWeight: 500 }}>{userProfile.zodiac || "-"}</Typography>
                  <Typography color="text.secondary">Interessen:</Typography>
                  <Typography sx={{ fontWeight: 500 }}>{userProfile.interests || "-"}</Typography>
                  <Typography color="text.secondary">Hobbys:</Typography>
                  <Typography sx={{ fontWeight: 500 }}>{userProfile.hobbies || "-"}</Typography>
                  <Typography color="text.secondary">Job:</Typography>
                  <Typography sx={{ fontWeight: 500 }}>{userProfile.job || "-"}</Typography>
                  <Typography color="text.secondary">Social:</Typography>
                  <Typography sx={{ fontWeight: 500 }}>{userProfile.social || "-"}</Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Card>
      )}
      {tab === "humandesign" && (
        <Card sx={{ mb: 4, borderRadius: 6, boxShadow: "0 4px 18px #ffd700", bgcolor: "linear-gradient(135deg,#fffde4 0%,#bbdefb 100%)", p: { xs: 2, sm: 4 }, border: "1px solid #ffd700" }}>
          <CardHeader sx={{ pb: 0, mb: 2, borderBottom: "1px solid #ffd700" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Sparkles style={{ color: "#1565c0", fontSize: 32, marginRight: 8 }} />
              <Typography variant="h6" sx={{ color: "#1565c0", fontWeight: 700 }}>
                Human Design Chart
              </Typography>
              <Button variant="outlined" sx={{ ml: "auto", borderColor: "#ffd700", color: "#ffd700", fontWeight: 600 }} startIcon={<Calculator />} onClick={handleChartCalculation} disabled={chartLoading}>
                {chartLoading ? "Berechne..." : "Chart berechnen"}
              </Button>
            </Box>
          </CardHeader>
          <CardContent>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 3, mb: 2, mt: 2 }}>
              {/* Felder für Human Design Daten */}
            </Box>
            <Typography variant="body2" sx={{ color: "#888", mt: 2 }}>
              Deine Human Design Daten sind die Basis für Chart, Reading und energetische Matches.
            </Typography>
            {chartResult && (
              <Box sx={{ mt: 3, p: 2, bgcolor: "#f6eec7", borderRadius: 3, color: "#7c3aed", boxShadow: "0 2px 8px #e0c3fc" }}>
                <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>{chartResult}</Typography>
                <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
                  <svg width="320" height="400" viewBox="0 0 320 400">
                    {/* SVG Chart ... */}
                  </svg>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      )}
      {tab === "chart-creator" && (
        <Card sx={{ mb: 4, borderRadius: 6, boxShadow: "0 4px 18px #1565c0", bgcolor: "#e3f2fd", p: { xs: 2, sm: 4 }, border: "1px solid #1565c0" }}>
          <CardHeader>
            {/* ...Header-Inhalt Chart... */}
          </CardHeader>
          <CardContent>
            {/* Chart-Berechnung und weitere Funktionen */}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default UserProfilePage;
