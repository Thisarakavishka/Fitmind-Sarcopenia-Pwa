"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../lib/supabase/client";
import { Card } from "../../../components/shared/Card";
import { Button } from "../../../components/shared/Button";
import { useRouter } from "next/navigation";
import { Icons } from "../../../components/shared/Icon";
import { Edit2 } from "lucide-react";

export default function AdminFoodsPage() {
  const supabase = createClient();
  const router = useRouter();
  const [foods, setFoods] = useState<any[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const defaultForm = {
    id: null,
    name: "",
    protein_per_100g: "",
    calories_per_100g: "",
    category: "Protein",
    is_leucine_rich: false,
    is_omega3_rich: false,
  };
  const [formData, setFormData] = useState(defaultForm);

  useEffect(() => {
    fetchFoods();
  }, []);

  async function fetchFoods() {
    const { data } = await supabase
      .from("food_library")
      .select("*")
      .order("name");
    if (data) setFoods(data);
  }

  const handleAddNewClick = () => {
    setFormData(defaultForm);
    setIsEditing(false);
    setIsFormOpen(!isFormOpen);
  };

  const handleEditClick = (food: any) => {
    setFormData({
      id: food.id,
      name: food.name,
      protein_per_100g: food.protein_per_100g,
      calories_per_100g: food.calories_per_100g,
      category: food.category || "Protein",
      is_leucine_rich: food.is_leucine_rich,
      is_omega3_rich: food.is_omega3_rich,
    });
    setIsEditing(true);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  async function handleSaveFood() {
    const foodPayload = {
      name: formData.name,
      protein_per_100g: Number(formData.protein_per_100g),
      calories_per_100g: Number(formData.calories_per_100g),
      category: formData.category,
      is_leucine_rich: formData.is_leucine_rich,
      is_omega3_rich: formData.is_omega3_rich,
    };

    let error;

    if (isEditing && formData.id) {
      const { error: updateError } = await supabase
        .from("food_library")
        .update(foodPayload)
        .eq("id", formData.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from("food_library")
        .insert(foodPayload);
      error = insertError;
    }

    if (!error) {
      setIsFormOpen(false);
      setFormData(defaultForm);
      fetchFoods(); 
    } else {
      alert("Error saving food to database.");
      console.error(error);
    }
  }

  async function handleDelete(id: string) {
    if (confirm("Delete this food from the clinical database?")) {
      await supabase.from("food_library").delete().eq("id", id);
      fetchFoods();
    }
  }

  return (
    <div className="w-full min-h-screen bg-transparent pb-32 pt-10 px-6 max-w-2xl mx-auto space-y-6 font-sans antialiased text-white">
      <header className="flex justify-between items-center border-b border-white/5 pb-4">
        <button
          onClick={() => router.back()}
          className="text-white/40 hover:text-white transition-colors"
        >
          ← Back
        </button>
        <h1 className="text-xl font-black uppercase italic">
          Food <span className="text-primary">Library</span>
        </h1>
      </header>

      <div className="flex justify-between items-center">
        <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">
          Master Database
        </p>
        <button
          onClick={handleAddNewClick}
          className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
            isFormOpen && !isEditing
              ? "bg-red-500/10 text-red-500"
              : "bg-primary/10 text-primary"
          }`}
        >
          {isFormOpen && !isEditing ? "✕ Cancel" : "+ Add Food"}
        </button>
      </div>

      {isFormOpen && (
        <Card className={`p-5 space-y-4 animate-in fade-in slide-in-from-top-4 border ${isEditing ? 'bg-primary/5 border-primary/30' : 'bg-[#0a0a0a] border-white/10'}`}>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
              {isEditing ? <><Edit2 size={14} /> Edit Food</> : "+ Add New Food"}
            </h2>
            {isEditing && (
              <button onClick={() => setIsFormOpen(false)} className="text-[10px] text-white/40 uppercase font-bold hover:text-white">Cancel</button>
            )}
          </div>

          <input
            type="text"
            placeholder="Food Name (e.g. Grilled Salmon)"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-primary/50 transition-colors"
          />
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[8px] font-bold text-white/40 uppercase ml-1">Protein (g) / 100g</label>
              <input
                type="number"
                placeholder="0"
                value={formData.protein_per_100g}
                onChange={(e) =>
                  setFormData({ ...formData, protein_per_100g: e.target.value })
                }
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-primary/50 transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[8px] font-bold text-white/40 uppercase ml-1">Calories / 100g</label>
              <input
                type="number"
                placeholder="0"
                value={formData.calories_per_100g}
                onChange={(e) =>
                  setFormData({ ...formData, calories_per_100g: e.target.value })
                }
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-primary/50 transition-colors"
              />
            </div>
          </div>
          
          <div className="flex gap-4 pt-2 border-t border-white/5 mt-4">
            <label className="flex items-center gap-2 text-[10px] font-bold uppercase text-white/60 cursor-pointer hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={formData.is_leucine_rich}
                onChange={(e) =>
                  setFormData({ ...formData, is_leucine_rich: e.target.checked })
                }
                className="accent-primary"
              />{" "}
              Leucine Rich
            </label>
            <label className="flex items-center gap-2 text-[10px] font-bold uppercase text-white/60 cursor-pointer hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={formData.is_omega3_rich}
                onChange={(e) =>
                  setFormData({ ...formData, is_omega3_rich: e.target.checked })
                }
                className="accent-primary"
              />{" "}
              Omega-3 Rich
            </label>
          </div>
          
          <Button
            onClick={handleSaveFood}
            className="w-full bg-primary text-black font-black uppercase text-xs py-4 rounded-xl shadow-lg hover:scale-[1.02] transition-transform"
          >
            {isEditing ? "Update Clinical Record" : "Save to Database"}
          </Button>
        </Card>
      )}

      {/* FOOD LIST */}
      <div className="space-y-3">
        {foods.map((food) => (
          <Card
            key={food.id}
            className="p-4 bg-[#0a0a0a] border-white/5 flex justify-between items-center group hover:border-white/20 transition-all"
          >
            <div className="flex flex-col">
              <h3 className="text-sm font-bold uppercase text-white">{food.name}</h3>
              <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest mt-1">
                {food.protein_per_100g}g Protein | {food.calories_per_100g} kcal
              </p>
              
              {/* 🌟 REFACTORED: Pills placed under the stats */}
              {(food.is_leucine_rich || food.is_omega3_rich) && (
                <div className="flex gap-1.5 mt-2">
                  {food.is_leucine_rich && (
                    <span className="text-[7px] text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">
                      Leucine
                    </span>
                  )}
                  {food.is_omega3_rich && (
                    <span className="text-[7px] text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">
                      Omega-3
                    </span>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleEditClick(food)}
                className="p-2 text-white/40 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                title="Edit"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => handleDelete(food.id)}
                className="p-2 text-red-500/60 hover:text-red-500 bg-red-500/5 hover:bg-red-500/10 rounded-lg transition-colors"
                title="Delete"
              >
                <Icons.Trash size={16} />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}