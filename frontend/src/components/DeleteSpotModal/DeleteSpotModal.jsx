import { useDispatch } from "react-redux";
import { useModal } from "../../context/Modal";
import "./DeleteSpotModal.css";
import * as spotActions from "../../store/spots";

const DeleteSpotModal = ({ spot }) => {
  const dispatch = useDispatch();
  const { closeModal } = useModal();

  const handleDeleteSpot = () => {
    dispatch(spotActions.deleteSpot(spot.id))
      .then(() => {
        dispatch(spotActions.fetchSpots());
        closeModal();
        alert("Spot Deleted");
      })
      .catch(() => {
        alert("Spot could not be deleted. Please try again later.");
      });
  };

  return (
    <div data-testid="delete-spot-modal">
      <h1>Confirm Delete</h1>
      <p>This action is permanent. Are You Sure You Want to Delete this Spot?</p>
      <div
        style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}
      >
        <button
          onClick={handleDeleteSpot}
          className="site-btn primary"
          style={{ backgroundColor: "red" }}
          data-testid="confirm-delete-spot-button"
        >
          Yes (Delete Spot)
        </button>
        <button
          onClick={closeModal}
          className="site-btn secondary"
          style={{
            width: "100%",
            maxWidth: "100%",
            backgroundColor: "gray",
            color: "white",
            border: "none"
          }}
          data-testid="cancel-delete-spot-button"
        >
          No (Keep Spot)
        </button>
      </div>
    </div>
  );
};

export default DeleteSpotModal;
