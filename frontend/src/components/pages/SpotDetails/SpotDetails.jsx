import { FaStar } from "react-icons/fa6";
import "./SpotDetails.css";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import * as spotActions from "../../../store/spots";
import * as reviewActions from "../../../store/reviews";
import OpenModalButton from "../../OpenModalButton";
import ReviewModal from "../../ReviewModal";
import { useModal } from "../../../context/Modal";
import Loading from "../../Loading/Loading";

const PlaceHolderImagesGrid = () => {
  const imageUrls = Array(4).fill(
    "https://placehold.co/600x400?text=No available image"
  );

  return (
    <>
      {imageUrls.map((url, index) => (
        <div
          key={index}
          className="images-grid__img-container"
          data-testid="spot-small-image"
        >
          <img src={url} alt={`Image ${index + 1}`} />
        </div>
      ))}
    </>
  );
};

const DeleteReviewModal = ({ spotId, review }) => {
  const dispatch = useDispatch();
  const { closeModal } = useModal();

  const handleDeleteReview = () => {
    const isRemoved = dispatch(reviewActions.removeReview(spotId, review.id));
    if (isRemoved) {
      alert("Review Deleted");
      dispatch(reviewActions.fetchReviews(spotId));
      dispatch(spotActions.fetchSpotDetails(spotId));
      closeModal();
    } else {
      alert("Uh-oh. Something went wrong");
    }
  };

  return (
    <div data-testid="delete-review-modal">
      <h1>Confirm Delete</h1>
      <p>Are you sure you want to delete this review?</p>
      <div
        style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}
      >
        <button
          onClick={handleDeleteReview}
          className="site-btn primary"
          style={{ backgroundColor: "red" }}
          data-testid="confirm-delete-review-button"
        >
          Yes (Delete Review)
        </button>
        <button
          onClick={closeModal}
          className="site-btn secondary"
          style={{
            width: "100%",
            maxWidth: "100%",
            backgroundColor: "gray",
            color: "white",
            border: "none",
          }}
        >
          No (Keep Review)
        </button>
      </div>
    </div>
  );
};

const SpotDetails = () => {
  const [loading, setLoading] = useState(true);
  const { spotId } = useParams();
  const { closeModal } = useModal();
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.session.user);
  const spot = useSelector((state) => state.spots.spotDetails);
  const reviewsBySpot = useSelector((state) => state.reviews.reviewsBySpot);
  const reviews = reviewsBySpot[spotId] || [];
  const mainImage = spot?.SpotImages.filter((img) => img.preview)[0];
  const secondaryImages = spot?.SpotImages.filter((img) => !img.preview);
  const isSpotOwner = spot?.Owner?.id === currentUser?.id;

  console.log("SPOT", spot);

  const userHasReviewed = reviews.some(
    (review) => review.userId === currentUser?.id
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      console.log("SPOT ID", spotId);
      await dispatch(spotActions.fetchSpotDetails(spotId));
      console.log("SPOT ID", spotId);
      await dispatch(reviewActions.fetchReviews(spotId));
      setLoading(false);
    };
    fetchData();
  }, [dispatch, spotId]);

  if (loading) {
    return <Loading />;
  }

  return (
    <main className="container">
      <div className="container__header">
        <h1 data-testid="spot-name">{spot?.name}</h1>
        <h3 data-testid="spot-location">
          <span data-testid="spot-city">{spot?.city}</span>,{" "}
          <span>{spot?.state}</span>, <span>{spot?.country}</span>
        </h3>
      </div>
      <div className="images-grid__main">
        <div className="images-grid__img-container">
          <img
            src={mainImage?.url}
            alt={`${spot?.name} preview image`}
            data-testid="spot-large-image"
          />
        </div>

        <div className="images-grid__secondary">
          {secondaryImages.length > 0 ? (
            <>
              {secondaryImages.map((img) => (
                <div className="images-grid__img-container" key={img.id}>
                  <img
                    src={img.url}
                    alt={`${spot?.name} preview image`}
                    data-testid="spot-small-image"
                  />
                </div>
              ))}
            </>
          ) : (
            <PlaceHolderImagesGrid />
          )}
        </div>
      </div>

      <div className="spot-details-grid">
        <div className="spot-details__content">
          <h2 data-testid="spot-host">
            Hosted by {spot?.Owner?.firstName} {spot?.Owner?.lastName}
          </h2>

          <div className="spot-details__description">
            <p data-testid="spot-description">{spot?.description}</p>
          </div>
        </div>

        <div className="spot-details__booking-info">
          <div className="spot-details__price" data-testid="spot-callout-box">
            <h3 data-testid="spot-price">${spot?.price}/night</h3>
            <div data-testid="spot-rating">
              <FaStar />{" "}
              {reviews.length === 0 ? (
                <span>New</span>
              ) : (
                <span>
                  <span>{spot?.avgStarRating?.toFixed(1)} </span>
                  <span style={{ position: "relative", bottom: ".375rem" }}>
                    .
                  </span>{" "}
                  {spot?.numReviews} review
                  {(spot?.numReviews > 1 || spot?.numReviews === 0) && "s"}
                </span>
              )}
            </div>
          </div>
          <button
            className="site-btn primary"
            onClick={() => alert("Feature coming soon")}
            data-testid="reserve-button"
          >
            Reserve
          </button>
        </div>
      </div>

      {/* Reviews */}
      <div className="spot-details__review-section">
        {reviews.length === 0 ? (
          <>
            <h2 data-id="reviews-heading">
              <FaStar /> New
            </h2>
            {currentUser && !isSpotOwner && !userHasReviewed && (
              <div>
                <OpenModalButton
                  buttonText={"Post Your Review"}
                  modalComponent={<ReviewModal spotId={spotId} />}
                  className="site-btn secondary"
                  data-testid="review-button"
                />
                <p>Be the first to post a review!</p>
              </div>
            )}
          </>
        ) : (
          <h2 data-id="reviews-heading">
            <FaStar /> {spot?.avgStarRating?.toFixed(1)}{" "}
            <span data-testid="review-count">
              <span style={{ position: "relative", bottom: ".375rem" }}>.</span>{" "}
              {spot?.numReviews} review{spot?.numReviews !== 1 && "s"}
            </span>
          </h2>
        )}

        {reviews.length > 0 && (
          <div>
            {currentUser && !isSpotOwner && !userHasReviewed && (
              <div>
                <OpenModalButton
                  buttonText={"Post Your Review"}
                  modalComponent={<ReviewModal spotId={spotId} />}
                  className="site-btn secondary"
                  style={{ margin: "0.625rem 0" }}
                  datatestid="review-button"
                />
              </div>
            )}
            {reviews.map((review) => (
              <div
                className="review-card"
                key={review.id}
                data-testid="review-item"
              >
                <div>
                  <h3>{review.User.firstName}</h3>
                  <p data-testid="review-date">
                    {new Date(review.createdAt).toLocaleDateString("en-US", {
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <p data-testid="review-text">{review.review}</p>
                {review.userId === currentUser?.id && (
                  <div className="review-actions">
                    <OpenModalButton
                      buttonText="Edit Review"
                      modalComponent={
                        <>
                          <h1>Feature Coming Soon!</h1>
                          <button
                            onClick={closeModal}
                            className="site-btn secondary"
                          >
                            Close
                          </button>
                        </>
                      }
                      className="site-btn secondary"
                    />
                    <OpenModalButton
                      buttonText={"Delete Review"}
                      modalComponent={
                        <DeleteReviewModal review={review} spotId={spotId} />
                      }
                      className="site-btn danger"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default SpotDetails;
