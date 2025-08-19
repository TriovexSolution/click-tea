import { useNavigation } from "@react-navigation/native";
import { Image, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ServiceNotAvailableScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Image source={{uri:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPpAh63HncAuJOC6TxWkGLYpS0WwNXswz9MA&s"}} style={{ width: 200, height: 200 }} />
      <Text style={{ fontSize: 20, fontWeight: "bold", marginTop: 20 }}>
        Service Not Available
      </Text>
      <Text style={{ color: "#666", textAlign: "center", marginVertical: 10, paddingHorizontal: 40 }}>
        Sorry, we don’t deliver in your area yet. Try changing location.
      </Text>
      <TouchableOpacity
        style={{
          backgroundColor: "#ff6600",
          padding: 15,
          borderRadius: 10,
          marginTop: 20,
        }}
        onPress={() => navigation.navigate("locationScreen")}
      >
        <Text style={{ color: "#fff", fontWeight: "bold" }}>Change Location</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default ServiceNotAvailableScreen