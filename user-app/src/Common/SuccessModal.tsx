// src/Common/SuccessModal.tsx
import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import theme from "../assets/colors/theme";

type Props = { visible: boolean; message?: string; onClose: () => void; title?: string; };
export default function SuccessModal({ visible, message = "", onClose, title = "Success" }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={s.card}>
          <Text style={s.title}>{title}</Text>
          <Text style={s.msg}>{message}</Text>
          <TouchableOpacity onPress={onClose} style={s.btn}>
            <Text style={s.btnText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", alignItems: "center", justifyContent: "center" },
  card: { width: "86%", backgroundColor: "#fff", padding: 18, borderRadius: 10, alignItems: "center" },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 6, color: theme.PRIMARY_COLOR },
  msg: { fontSize: 14, color: "#444", textAlign: "center", marginBottom: 14 },
  btn: { backgroundColor: theme.PRIMARY_COLOR, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  btnText: { color: "#fff", fontWeight: "700" },
});
