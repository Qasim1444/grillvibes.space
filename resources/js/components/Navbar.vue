<template>
  <div class="navbar">
    <div class="navbar-brand">
      <h2>Admin Dashboard</h2>
    </div>
    <div class="navbar-user">
      <router-link to="/profile" class="user-link">
        <span class="user-name">{{ user.name }}</span>
        <i class="fas fa-user"></i>
      </router-link>
      <button class="btn btn-sm btn-danger ms-2" @click="logout">Logout</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import http from "../services/http";

const router = useRouter();
const user = ref({ name: "Loading..." });

const fetchUser = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    router.push("/login");
    return;
  }
  try {
    const res = await http.get("/logged-user");
    user.value = res.data;
  } catch (error) {
    console.error(error);
    localStorage.removeItem("token");
    router.push("/login");
  }
};

const logout = async () => {
  const token = localStorage.getItem("token");
  try {
    await http.post("/logout");
    localStorage.removeItem("token");
    router.push("/login");
  } catch (error) {
    console.error(error);
    localStorage.removeItem("token");
    router.push("/login");
  }
};

onMounted(() => {
  fetchUser();
});
</script>

<style>
.navbar {
  background: #34495e;
  color: white;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.navbar-brand h2 {
  margin: 0;
  font-size: 1.5rem;
}

.navbar-user {
  display: flex;
  align-items: center;
}

.user-link {
  color: white;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-link:hover {
  color: #3498db;
}

.user-name {
  font-weight: 500;
}
</style>
