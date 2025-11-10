import { supabase } from "../config/supabaseClient.js";

const TABLE = "sensor_readings";

function normalize(row) {
  if (!row) return row;
  return {
    ...row,
    temperature: row.temperature === null ? null : Number(row.temperature),
    threshold_value:
      row.threshold_value === null ? null : Number(row.threshold_value),
    // --- TAMBAHAN ---
    temperature_difference:
      row.temperature_difference === null ? null : Number(row.temperature_difference),
    // --- AKHIR TAMBAHAN ---
  };
}

export const ReadingsModel = {
  async list() {
    const { data, error } = await supabase
      .from(TABLE)
      // --- MODIFIKASI ---
      .select("id, temperature, threshold_value, temperature_difference, recorded_at")
      // --- AKHIR MODIFIKASI ---
      .order("recorded_at", { ascending: false })
      .limit(100);

    if (error) throw error;
    return data.map(normalize);
  },

  async latest() {
    const { data, error } = await supabase
      .from(TABLE)
      // --- MODIFIKASI ---
      .select("id, temperature, threshold_value, temperature_difference, recorded_at")
      // --- AKHIR MODIFIKASI ---
      .order("recorded_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return normalize(data);
  },

  async create(payload) {
    const { temperature, threshold_value } = payload;

    if (typeof temperature !== "number") {
      throw new Error("temperature must be a number");
    }

    // --- TAMBAHAN: Hitung selisih temperatur ---
    const difference =
      typeof temperature === "number" && typeof threshold_value === "number"
        ? temperature - threshold_value
        : null;
    // --- AKHIR TAMBAHAN ---

    const newRow = {
      temperature,
      threshold_value: threshold_value ?? null,
      // --- TAMBAHAN ---
      temperature_difference: difference,
      // --- AKHIR TAMBAHAN ---
    };

    const { data, error } = await supabase
      .from(TABLE)
      .insert(newRow)
      // --- MODIFIKASI ---
      .select("id, temperature, threshold_value, temperature_difference, recorded_at")
      // --- AKHIR MODIFIKASI ---
      .single();

    if (error) throw error;
    return normalize(data);
  },
};