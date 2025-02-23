import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import icon from "../icons/thenews.webp";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import styles from "../components/AdminDashboard.module.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface OpenData {
  openedAt: string;
  postId: string;
}

interface UserData {
  email: string;
  streak: number;
  opens: OpenData[];
}

interface ApiResponse {
  totalOpens: number;
  ranking: UserData[];
}

interface ProcessedData {
  totalOpens: number;
  ranking: Array<{ email: string; streak: number }>;
  engagementData: Array<{ date: string; opens: number }>;
}

interface Post {
  id: string;
  title: string;
}

const AdminDashboard = () => {
  const [processedData, setProcessedData] = useState<ProcessedData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedPostId, setSelectedPostId] = useState<string>("");

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get<Post[]>(
          "http://localhost:3000/api/posts"
        );
        setPosts(response.data);
      } catch (error) {
        console.error("Erro ao buscar posts:", error);
      } finally {
        setPostsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const processData = (apiData: ApiResponse): ProcessedData => {
    const opensMap = new Map<string, number>();

    apiData.ranking.forEach((user) => {
      user.opens.forEach((open) => {
        if (selectedPostId && open.postId !== selectedPostId) return;

        const date = new Date(open.openedAt).toISOString().split("T")[0];
        opensMap.set(date, (opensMap.get(date) || 0) + 1);
      });
    });

    return {
      totalOpens: apiData.totalOpens,
      ranking: apiData.ranking
        .map((user) => ({
          email: user.email || "Email indisponível",
          streak: user.streak || 0,
        }))
        .sort((a, b) => b.streak - a.streak),
      engagementData: Array.from(opensMap.entries())
        .map(([date, count]) => ({ date, opens: count }))
        .sort((a, b) => a.date.localeCompare(b.date)),
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get<ApiResponse>(
          `http://localhost:3000/api/admin/metrics?postId=${
            selectedPostId || ""
          }`
        );
        const processed = processData(response.data);
        setProcessedData(processed);
        setError(null);
      } catch (error) {
        const errorMessage = axios.isAxiosError(error)
          ? `Erro na requisição: ${error.message}`
          : error instanceof Error
          ? error.message
          : "Erro desconhecido";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedPostId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const filterDataByDate = (data: Array<{ date: string; opens: number }>) => {
    if (!startDate && !endDate) return data;
    return data.filter((item) => {
      const itemDate = new Date(item.date);
      return (
        (!startDate || itemDate >= new Date(startDate)) &&
        (!endDate || itemDate <= new Date(endDate))
      );
    });
  };

  const filteredEngagementData = filterDataByDate(
    processedData?.engagementData || []
  );

  const chartData = {
    labels: filteredEngagementData.map((data) => formatDate(data.date)),
    datasets: [
      {
        label: "Aberturas",
        data: filteredEngagementData.map((data) => data.opens),
        borderColor: "#FFCE04",
        backgroundColor: "#240E0B",
        fill: true,
      },
    ],
  };

  return (
    <div className={styles.dashboardContainer}>
      <img src={icon} />
      <h2>Filtros</h2>
      <div className={styles.filters}>
        <label>
          Data Início:
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>
        <label>
          Data Fim:
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>
        <label>
          Selecione o Post:
          <select
            value={selectedPostId}
            onChange={(e) => setSelectedPostId(e.target.value)}
          >
            <option value="">Todos</option>
            {posts.map((post) => (
              <option key={post.id} value={post.id}>
                {post.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      <h2>Ranking de Usuários</h2>
      <table className={styles.rankingTable}>
        <thead>
          <tr>
            <th>Email</th>
            <th>Streak</th>
          </tr>
        </thead>
        <tbody>
          {processedData?.ranking.map((user, index) => (
            <tr key={index}>
              <td>{user.email}</td>
              <td>{user.streak}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Engajamento por Data</h2>
      <div>
        {filteredEngagementData.length ? (
          <Line data={chartData} />
        ) : (
          <p>Nenhum dado encontrado</p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
