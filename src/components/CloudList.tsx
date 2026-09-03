import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabaseClient";

interface Todo {
  id: string | number;
  title: string;
}

export default function CloudList() {
  const [items, setItems] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Mengambil data dari cloud
  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase.from("todos").select("*");
      if (data) {
        setItems(data); // 2. Menyimpan ke dalam state
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <p>Memuat data...</p>;

  return (
    <ul>
      {/* AnimatePresence mendeteksi jika ada data yang dihapus/ditambah dari cloud */}
      <AnimatePresence>
        {items.map((item) => (
          <motion.li
            key={item.id} // Penting: key harus unik dari database
            initial={{ opacity: 0, y: 20 }} // Posisi awal sebelum data muncul
            animate={{ opacity: 1, y: 0 }} // Animasi saat data berhasil dimuat
            exit={{ opacity: 0, x: -100 }} // Animasi jika data dihapus dari cloud
            layout // Mengatur posisi item lain secara otomatis jika ada perubahan
          >
            {item.title}
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}
