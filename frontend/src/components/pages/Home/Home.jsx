import "./Home.css";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import * as spotActions from "../../../store/spots";
import SpotCard from "../../SpotCard";

const Home = () => {
  const dispatch = useDispatch();
  const spots = useSelector((state) => state.spots.allSpots);

  useEffect(() => {
    dispatch(spotActions.fetchSpots());
  }, [dispatch]);

  return (
    <main className="home-container">
      <h1>
        You&apos;ll want to go there <span className="primary">and back again.</span>
      </h1>
      <div className="spots-grid" data-testid="spots-list">
        {spots.map((spot) => (
          <SpotCard spot={spot} key={spot.id} />
        ))}
      </div>
    </main>
  );
};

export default Home;
