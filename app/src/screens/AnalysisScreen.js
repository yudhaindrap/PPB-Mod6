import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Api } from "../services/api"; // tetap sama

function TableHeader() {
  return (
    <View style={[styles.tableRow, styles.tableHeader]}>
      <Text style={[styles.tableCell, styles.headerText, { flex: 2, textAlign: "left" }]}>
        🕒 Timestamp
      </Text>
      <Text style={[styles.tableCell, styles.headerText, { flex: 1 }]}>
        Δ Selisih (°C)
      </Text>
    </View>
  );
}

function TableRow({ item }) {
  const formattedTimestamp = new Date(item.recorded_at).toLocaleString("id-ID", {
    dateStyle: "short",
    timeStyle: "medium",
  });

  const difference =
    item.temperature_difference === null
      ? "N/A"
      : item.temperature_difference.toFixed(2);

  return (
    <View style={styles.tableRow}>
      <Text style={[styles.tableCell, { flex: 2, textAlign: "left" }]}>
        {formattedTimestamp}
      </Text>
      <Text
        style={[
          styles.tableCell,
          {
            flex: 1,
            color:
              difference === "N/A"
                ? "#9CA3AF"
                : parseFloat(difference) > 0
                ? "#DC2626" // merah jika naik
                : "#059669", // hijau jika turun
          },
        ]}
      >
        {difference}
      </Text>
    </View>
  );
}

export function AnalysisScreen() {
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const data = await Api.getSensorReadings();
      setReadings(data);
    } catch (error) {
      console.error("Gagal mengambil data analisis:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={{ marginTop: 10, color: "#6B7280" }}>Memuat data...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.title}>📊 Analisis Selisih Temperatur</Text>
      <View style={styles.card}>
        <Text style={styles.subtitle}>
          Data perbandingan suhu dan ambang batas (threshold)
        </Text>
        <View style={styles.table}>
          <TableHeader />
          {readings.length > 0 ? (
            readings.map((item) => <TableRow key={item.id} item={item} />)
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Data tidak ditemukan.</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f3f4f6",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
    color: "#1f2937",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  table: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    overflow: "hidden",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  tableHeader: {
    backgroundColor: "#eff6ff",
  },
  tableCell: {
    padding: 12,
    fontSize: 14,
    color: "#374151",
    textAlign: "right",
  },
  headerText: {
    fontWeight: "600",
    color: "#1d4ed8",
  },
  emptyContainer: {
    padding: 16,
    alignItems: "center",
  },
  emptyText: {
    color: "#9CA3AF",
    fontStyle: "italic",
  },
});
