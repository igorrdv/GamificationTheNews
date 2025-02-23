import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./DashboardScreen.module.css";
import icon from "../icons/thenews.webp";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const longestStreak = (opens: Array<{ openedAt: string }>): number => {
  if (!opens || opens.length === 0) return 0;

  const dates = opens
    .map((o) => new Date(o.openedAt))
    .sort((a, b) => a.getTime() - b.getTime());

  let longest = 1;
  let current = 1;
  for (let i = 1; i < dates.length; i++) {
    const diff =
      (dates[i].getTime() - dates[i - 1].getTime()) / (1000 * 60 * 60 * 24);
    if (diff >= 0.9 && diff <= 1.1) {
      current++;
    } else {
      if (current > longest) longest = current;
      current = 1;
    }
  }
  return current > longest ? current : longest;
};

const DashboardScreen = () => {
  const [currentStreak, setCurrentStreak] = useState(0);
  const [personalRecord, setPersonalRecord] = useState(0);
  const [totalReadings, setTotalReadings] = useState(0);
  const [readDates, setReadDates] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) {
      navigate("/");
    } else {
      fetchUserData(userEmail);
    }
  }, [navigate]);

  const fetchUserData = async (userEmail: string) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/users/${userEmail}`
      );
      const data = await response.json();
      if (data.user) {
        const user = data.user;
        setCurrentStreak(user.streak);
        setTotalReadings(user.opens ? user.opens.length : 0);
        setPersonalRecord(longestStreak(user.opens || []));

        const formattedDates = (user.opens || []).map(
          (o: { openedAt: string }) =>
            new Date(o.openedAt).toISOString().split("T")[0]
        );
        setReadDates(formattedDates);
      } else {
        console.error("Erro ao buscar os dados do usuário:", data);
      }
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
    }
  };

  const tileClassName = ({ date }: { date: Date }) => {
    const formattedDate = date.toISOString().split("T")[0];
    return readDates.includes(formattedDate) ? styles.readDay : "";
  };

  return (
    <div className={styles.container}>
      <img src={icon} className={styles.img} alt="The News Icon" />
      <div>
        <p className={styles.title}>Sua Jornada de Leitura</p>
        <p className={styles.subtitle}>Acompanhe seu progresso diário</p>
      </div>
      <div className={styles.streakbox}>
        <div className={styles.boxes}>
          <div className={styles.box}>
            <span className={styles.emoji}>🌱</span>
            <span className={styles.text}>{currentStreak}</span>
          </div>
          <p>Dias Seguidos</p>
        </div>
        <div className={styles.boxes}>
          <div className={styles.box}>
            <span className={styles.emoji}>🏆</span>
            <span className={styles.text}>{personalRecord}</span>
          </div>
          <p>Recorde Pessoal</p>
        </div>
        <div className={styles.boxes}>
          <div className={styles.box}>
            <span className={styles.emoji}>📚</span>
            <span className={styles.text}>{totalReadings}</span>
          </div>
          <p>Total de Leituras</p>
        </div>
      </div>

      <div>
        <div className={styles.calendar}>
          <p className={styles.p}>Histórico de Leituras</p>
          <Calendar calendarType="gregory" tileClassName={tileClassName} />
        </div>
      </div>
      <div>
        <p className={styles.p}>Você consegue, não deixe seu streak acabar.</p>
      </div>
    </div>
  );
};

export default DashboardScreen;
