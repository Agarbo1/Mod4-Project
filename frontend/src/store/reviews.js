import { csrfFetch } from "./csrf";


const SET_REVIEWS = "reviews/SET_REVIEWS";
const ADD_REVIEW = "reviews/ADD_REVIEW";
const DELETE_REVIEW = "reviews/DELETE_REVIEW";
const SET_REVIEW_ERROR = "reviews/SET_REVIEW_ERROR";


export const setReviews = (spotId, reviews) => ({
  type: SET_REVIEWS,
  payload: { spotId, reviews },
});

export const addReview = (review) => ({
  type: ADD_REVIEW,
  payload: review,
});

export const deleteReview = (reviewId) => ({
  type: DELETE_REVIEW,
  payload: reviewId,
});

export const setReviewError = (error) => ({
  type: SET_REVIEW_ERROR,
  payload: error,
});


export const fetchReviews = (spotId) => async (dispatch) => {
  try {
    const response = await csrfFetch(`/api/spots/${spotId}/reviews`);
    const data = await response.json();
    const reviews = data?.Reviews ?? [];
    dispatch(setReviews(spotId, reviews));
  } catch (error) {
    dispatch(setReviewError(error?.errors || "Error fetching reviews"));
  }
};

export const addNewReview = (spotId, review) => async (dispatch) => {
  try {
    const response = await csrfFetch(`/api/spots/${spotId}/reviews`, {
      method: "POST",
      body: JSON.stringify(review),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return errorData.errors;
    }

    const newReview = await response.json();

    const normalized = newReview.spotId ? newReview : { ...newReview, spotId };
    dispatch(addReview(normalized));

    await dispatch(fetchReviews(spotId));
    return true;
  } catch (error) {
    return error?.errors || ["Error adding review"];
  }
};

export const removeReview = (reviewId, spotId) => async (dispatch) => {
  try {
    const response = await csrfFetch(`/api/reviews/${reviewId}`, { method: "DELETE" });
    if (response.status === 204 || response.ok) {
      dispatch(deleteReview(reviewId));
      await dispatch(fetchReviews(spotId));
      return true;
    } else {
      const data = await response.json();
      dispatch(setReviewError(data?.errors || "Error deleting review"));
      return false;
    }
  } catch (error) {
    dispatch(setReviewError("Error deleting review"));
    return false;
  }
}


const initialState = {
  reviewsBySpot: {},
  error: null,
};


const reviewsReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_REVIEWS: {
      const { spotId, reviews } = action.payload || {};
      if (!spotId) return state;
      return {
        ...state,
        reviewsBySpot: {
          ...state.reviewsBySpot,
          [spotId]: reviews,
        },
        error: null,
      };
    }

    case ADD_REVIEW: {
      const review = action.payload;
      const { spotId } = review || {};
      if (!spotId) return state;
      return {
        ...state,
        reviewsBySpot: {
          ...state.reviewsBySpot,
          [spotId]: [review, ...(state.reviewsBySpot[spotId] || [])],
        },
        error: null,
      };
    }

    case DELETE_REVIEW: {
      const reviewId = action.payload;
      let targetSpotId = null;

      // Find the spotId containing the review to delete
      for (const id of Object.keys(state.reviewsBySpot)) {
        const reviews = state.reviewsBySpot[id] || [];
        if (reviews.find((r) => r.id === reviewId)) {
          targetSpotId = id;
          break;
        }
      }

      if (!targetSpotId) return state;

      return {
        ...state,
        reviewsBySpot: {
          ...state.reviewsBySpot,
          [targetSpotId]: state.reviewsBySpot[targetSpotId].filter(
            (r) => r.id !== reviewId
          ),
        },
        error: null,
      };
    }

    case SET_REVIEW_ERROR: {
      return {
        ...state,
        error: action.payload || "Unknown error",
      };
    }

    default:
      return state;
  }
};

export default reviewsReducer;