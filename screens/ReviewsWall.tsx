import { Text, FlatList, View, TouchableOpacity, Image } from "react-native";
import axios from "axios";
import { useState, useEffect } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../components/Nav";
import { useAuthContext } from "../assets/context/AuthContext";
import { ZodError, z } from "zod";
import { getReviewSchema } from "../assets/zodSchema/reviewSchemaFile";
import { getReviewObject } from "../assets/zodSchema/reviewSchemaFile";
import { verifyParsedData } from "../assets/tools/verifyParsedData";
import CardReview from "../components/CardReview";
import LottiesView from "../components/LottiesView";

type Props = NativeStackScreenProps<RootStackParamList>;

type TReviewArray = z.infer<typeof getReviewSchema>;
type TReviewObject = z.infer<typeof getReviewObject>;

export default function ReviewsWall({ navigation }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<TReviewArray | null>(null);
  const [zodError, setZodError] = useState<ZodError | null>(null);
  const [reload, setReload] = useState<boolean>(false);

  const { userToken } = useAuthContext();

  useEffect(() => {
    const getData = async () => {
      try {
        let query = "";
        const { data } = await axios.get(
          `https://site--givemovies-backend--fwddjdqr85yq.code.run/review/all`,
          {
            headers: {
              Authorization: `Bearer ${userToken}`,
              "Content-Type": "Application/json",
            },
          }
        );

        const parsedData = verifyParsedData<TReviewArray>(
          data,
          getReviewSchema,
          zodError,
          setZodError
        );

        setIsLoading(false);
        setData(parsedData);
      } catch (error: any) {
        console.log(error);
      }
    };
    getData();
  }, []);

  return isLoading ? (
    <LottiesView />
  ) : (
    <>
      <View className="items-center  bg-black border-b-2 border-zinc-100">
        <TouchableOpacity onPress={() => navigation.navigate("Movies")}>
          <View className=" p-5 ">
            <Text className="bg-purple-700 text-white p-3 rounded-3xl">
              GO TO MOVIES
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <FlatList
        contentContainerStyle={{
          alignItems: "center",
        }}
        className="bg-black pt-3"
        data={data && data}
        keyExtractor={(item: TReviewObject) => String(item._id)}
        renderItem={({ item }) => (
          <View
            className=" mb-[50]
           border-b-2 border-zinc-100 items-center "
          >
            <CardReview reviewItem={item} setReload={setReload} />
            <View
              className=" h-[210] w-[154] flex items-center justify-center mt-4 "
              key={item._id}
            >
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("Movie", { id: item.movieID })
                }
              >
                <Image
                  source={{ uri: item.poster }}
                  className="w-[100] h-[140]"
                />

                <Text className="text-white text-center h-[40] mt-2">
                  {item.title.toUpperCase()}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </>
  );
}
