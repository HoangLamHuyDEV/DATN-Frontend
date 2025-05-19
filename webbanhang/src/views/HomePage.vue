<template>
  <v-app>
    <!-- Toolbar -->
    <Header />
    
    <!-- Main Content -->
    <v-main>
      <v-container class="mt-5">
        <v-row>
          
          <!-- Side Menu -->
          <v-col cols="12" md="3">
            <v-sheet class="pa-4 rounded-xl" elevation="1">
              <h4 class="text-h6 font-weight-bold mb-3">Danh mục sản phẩm</h4>
              <div style="max-height: 45vh; overflow-y: auto">
                <v-list density="compact" nav>
                  <v-list-item @click="resetFilter">
                    <v-list-item-title><h3 style="color: mintcream">Tất cả danh mục</h3></v-list-item-title>
                  </v-list-item>
                  <v-list-item v-for="type in productTypes" :key="type" @click="filterByType(type)">
                    <v-list-item-title>{{ type }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </div>
            </v-sheet>
          </v-col>
          <!-- Promotional Banner -->
          <v-col cols="12" md="9">
            <v-img src="https://cdn.vuetifyjs.com/images/carousel/squirrel.jpg" height="440px" class="rounded-xl" cover>
              <v-container fill-height class="d-flex align-center justify-center text-center">
                <div class="text-white">
                  <h2 class="text-h4 font-weight-bold mb-2">🔥 Khuyến mãi mùa hè!</h2>
                  <p class="text-subtitle-1">Giảm giá đến 50% cho các sản phẩm mới nhất</p>
                  <v-btn color="primary" class="mt-4" @click="router.push('/sale')">Xem ngay</v-btn>
                </div>
              </v-container>
            </v-img>
          </v-col>
        </v-row>
      </v-container>

      <!-- Product List -->
      <v-container class="mt-5">
        <div v-for="(items, type) in products" :key="type" class="mb-8">
          <v-sheet color="red-yellow-lighten-5" rounded="xl" class="pa-4 mb-4">
            <div class="d-flex justify-space-between align-center">
              <h2 class="text-h5 font-weight-bold mb-0">{{ type }}</h2>
              <v-btn v-if="isFiltered" class="text-caption" @click="resetFilter">
                Quay lại
              </v-btn>
              <v-btn v-else   class="text-caption" @click="filterByType(type)">
                Xem thêm
              </v-btn>
            </div>
          </v-sheet>

          <v-row dense>
            <v-col v-for="product in (isFiltered ? items : items.slice(0, 8))" :key="product.product_id" cols="12"
              sm="6" md="4" lg="3" class="pa-5">
              <v-card @click="router.push(`/product/${product.product_id}`)" class="cursor-pointer" elevation="2"
                rounded="xl">
                <v-img :src="getImageUrl(product.imgName)" height="150px" cover class="rounded-t-xl"></v-img>
                <v-card-title>{{ product.name }}</v-card-title>
                <v-card-subtitle>
                  <div>Thương hiệu: {{ product.brand }}</div>
                  <div>Màu sắc: {{ product.color }}</div>
                  <div>Kích thước: {{ product.size }} {{ product.unit }}</div>
                </v-card-subtitle>
                <v-card-text>
                  <strong>Giá:</strong> {{ product.price.toLocaleString() }}₫
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>
      </v-container>

      <!-- Chatbot Widget -->
      <div v-if="showChatbot" class="chatbot-container">
        <v-sheet class="chatbot" elevation="3" rounded="lg">
          <div class="chatbot-header d-flex justify-between align-center">
            <span class="font-weight-bold">Chatbot</span>
          </div>
          <v-divider></v-divider>
          <div class="chatbot-messages" style="max-height: 300px; overflow-y: auto;">
            <div v-for="(message, index) in chatbotMessages" :key="index" class="chatbot-message">
              <div v-if="message.fromUser" class="user-message">{{ message.text }}</div>
              <div v-else class="bot-message">{{ message.text }}</div>
            </div>
          </div>
          <v-divider></v-divider>
          <v-text-field v-model="userMessage" @keydown.enter="sendMessage" label="Type a message..." outlined dense />
        </v-sheet>
      </div>
    </v-main>
   <!-- Floating Chatbot Button -->
<v-btn icon fab color="primary" class="chatbot-fab" @click="toggleChatbot">
  <v-icon>mdi-chat</v-icon>
</v-btn>

    <Footer />
  </v-app>
</template>

<script setup>
import Footer from '../views/Footer.vue';
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import Header from './Header.vue';

const searchQuery = ref("");
const router = useRouter();
const username = ref("");
const userInfo = ref({});
const allProducts = ref({});
const products = ref({});
const productTypes = ref([]);
const isFiltered = ref(false);
const showChatbot = ref(false);  // Chatbot visibility toggle
const userMessage = ref("");     // User input for chatbot
const chatbotMessages = ref([]); // Messages in chatbot
const isLoading = ref(false);
// Toggle chatbot visibility
const toggleChatbot = () => {
  showChatbot.value = !showChatbot.value;
};

// Send message to chatbot (simple simulation)


const sendMessage = async () => {
  if (userMessage.value.trim() === "" || isLoading.value) return;

  chatbotMessages.value.push({ text: userMessage.value, fromUser: true });

  isLoading.value = true; // Bắt đầu loading

  try {
    const res = await axios.post("http://localhost:8080/api/chatbot", {
      message: userMessage.value,
    });
    chatbotMessages.value.push({ text: res.data.reply, fromUser: false });
  } catch (err) {
    chatbotMessages.value.push({
      text: "Lỗi ChatGPT: " + (err.response?.data?.error || err.message),
      fromUser: false,
    });
  } finally {
    userMessage.value = "";
    isLoading.value = false; // Kết thúc loading
  }
};


// Fetch user information
onMounted(async () => {
  const token = localStorage.getItem("access_token");
  if (token) {
    try {
      const response = await axios.get("http://localhost:8080/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      username.value = response.data.username;
      userInfo.value = response.data;
    } catch (error) {
      console.error("Lỗi khi lấy thông tin người dùng", error);
    }
  }

  // Fetch product list
  try {
    const res = await axios.get("http://localhost:8080/api/products/soft?soft=typeUp");
    const grouped = {};
    for (const product of res.data) {
      if (!grouped[product.type]) {
        grouped[product.type] = [];
      }
      grouped[product.type].push(product);
    }
    allProducts.value = grouped;
    products.value = grouped;
    productTypes.value = Object.keys(grouped);
  } catch (err) {
    console.error("Lỗi khi tải sản phẩm:", err);
  }
});

// Filter products by type
const filterByType = (type) => {
  products.value = { [type]: allProducts.value[type] };
  isFiltered.value = true;
};

const resetFilter = () => {
  products.value = allProducts.value;
  isFiltered.value = false;
};

const getImageUrl = (imgName) => {
  if (!imgName) {
    return "https://cdn.vuetifyjs.com/images/cards/sunshine.jpg";
  }
  return `http://localhost:8080/api/images/${imgName}`;
};
</script>

<style scoped>
.v-main {
  background-color: #ffffff !important;
}

/* Chatbot styles */
.chatbot-container {
  position: fixed;
  bottom: 120px;
  right: 20px;
  width: 400px;
  /* max-height: 800px; */
}

.chatbot {
  width: 100%;
}

.chatbot-header {
  background-color: #16d7f5;
  color: white;
  padding: 10px;
  font-size: 1.2em;
}

.chatbot-messages {
  padding: 10px;
  background-color: #f1f1f1;
  height: 400px;
}

.user-message {
  text-align: right;
  background-color: #0aef62;
  padding: 8px;
  border-radius: 12px;
  margin: 5px 0;
}

.bot-message {
  text-align: left;
  background-color: #6fbeec;
  padding: 8px;
  border-radius: 12px;
  margin: 5px 0;
}

.chatbot-fab {
  position: fixed;
  bottom: 60px;
  right: 30px;
  z-index: 999;
}

</style>
