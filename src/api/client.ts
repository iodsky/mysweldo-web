import axios from "axios";

const client = axios.create({
  baseURL: "http://localhost:8001/api",
  withCredentials: true,
});

export default client;
