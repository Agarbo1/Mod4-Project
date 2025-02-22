import { csrfFetch } from "./csrf";

const SET_SPOTS = "spots/SET_SPOTS";
const ADD_SPOT = "spots/ADD_SPOT";
const SET_SPOT_DETAILS = "spots/GET_SPOT_DETAILS";
const SET_SPOT_REVIEWS = "spots/SET_SPOT_REVIEWS";
const ADD_SPOT_IMAGE = "spots/ADD_SPOT_IMAGE";
const SET_SPOT_IMAGES = "spots/ADD_SPOT_IMAGE";
const UPDATE_SPOT = "spots/UPDATE_SPOT";
const DELETE_SPOT = "spots/DELETE_SPOT";

// Action Creators
export const setSpots = (spots) => {
  return {
    type: SET_SPOTS,
    payload: spots
  };
};

export const setSpotDetails = (spot) => {
  return {
    type: SET_SPOT_DETAILS,
    payload: spot
  };
};

export const setSpotReviews = (reviews) => {
  return {
    type: SET_SPOT_REVIEWS,
    payload: reviews
  };
};

export const setSpotImages = (images) => {
  return {
    type: SET_SPOT_IMAGES,
    payload: images
  };
};

export const deleteSpotAction = (spotId) => {
  return {
    type: DELETE_SPOT,
    payload: spotId
  };
};

export const addSpotAction = (spot) => {
  return {
    type: ADD_SPOT,
    payload: spot
  };
};
export const updateSpotAction = (spot) => {
  return {
    type: UPDATE_SPOT,
    payload: spot
  };
};

export const addSpotImage = (image) => {
  return {
    type: ADD_SPOT_IMAGE,
    payload: image
  };
};

// Action Functions
export const fetchSpots = () => (dispatch) => {
  csrfFetch("/api/spots")
    .then((response) => response.json())
    .then((data) => dispatch(setSpots(data.Spots)))
    .catch((error) => console.error(error));
};

export const fetchSpotDetails = (spotId) => async (dispatch) => {
  try {
    const response = await csrfFetch(`/api/spots/${spotId}`);
    const data = await response.json();

    console.log("DATA FROM FETCH SPOT DETAILS", data);

    dispatch(setSpotDetails(data));

    const reviewResponse = await csrfFetch(`/api/spots/${spotId}/reviews`);
    const reviewData = await reviewResponse.json();

    dispatch(setSpotReviews(reviewData.Reviews));

    return { spot: data };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const addSpot = (spotDetails, imageUrls) => async (dispatch) => {
  try {
    const response = await csrfFetch("/api/spots", {
      method: "POST",
      body: JSON.stringify(spotDetails)
    });

    const spotData = await response.json();
    console.log("SPOT DATA", spotData);
    dispatch(addSpotAction(spotData));

    for (const url of imageUrls) {
      const imgDetails = {
        url,
        spotId: spotData.id,
        preview: url === imageUrls[0]
      };

      await csrfFetch(`/api/spots/${spotData.spot.id}/images`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(imgDetails)
      });
    }
    return { spot: spotData };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const updateSpot =
  (spotId, spotDetails, imgUrls) => async (dispatch) => {
    try {
      const spotResponse = await csrfFetch(`/api/spots/${spotId}`, {
        method: "PUT",
        body: JSON.stringify(spotDetails)
      });

      if (!spotResponse.ok) {
        return false;
      }
      const spotData = await spotResponse.json();
      dispatch(updateSpotAction(spotData));
      const updatedSpot = await dispatch(fetchSpotDetails(spotId));
      const currentImages = updatedSpot.spot.SpotImages;

      for (const img of currentImages) {
        await csrfFetch(`/api/spot-images/${img.id}`, {
          method: "DELETE"
        });
      }

      for (const url of imgUrls) {
        const imgDetails = {
          url,
          spotId,
          preview: url === imgUrls[0]
        };

        const imageResponse = await csrfFetch(`/api/spots/${spotId}/images`, {
          method: "POST",
          body: JSON.stringify(imgDetails)
        });

        const newImage = await imageResponse.json();
        dispatch(addSpotImage(newImage));
      }
      return { spot: spotData };
    } catch (error) {
      console.error(error);
      return error.errors;
    }
  };

export const deleteSpot = (spotId) => async (dispatch) => {
  try {
    const response = await csrfFetch(`/api/spots/${spotId}`, {
      method: "DELETE"
    });

    if (response.ok) {
      dispatch(deleteSpotAction());
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error(error);
    return error.errors;
  }
};

const initialState = {
  byId: {},
  allSpots: [],
  spotDetails: null
};

const spotsReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_SPOTS: {
      const { byId, allSpots } = _normalizeSpots(action.payload);
      return {
        ...state,
        byId,
        allSpots
      };
    }

    case SET_SPOT_DETAILS: {
      console.log("SPOT DETAILS", action.payload);
      return {
        ...state,
        spotDetails: action.payload || {}
      };
    }

    case SET_SPOT_REVIEWS: {
      const sortedReviews = action.payload.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      const updatedSpotDetails = {
        ...state.spotDetails,
        Reviews: sortedReviews
      };

      return {
        ...state,
        spotDetails: updatedSpotDetails
      };
    }

    case ADD_SPOT: {
      const { byId, allSpots } = _normalizeSpots([action.payload]);
      return {
        ...state,
        byId: { ...state.byId, ...byId },
        allSpots: [...state.allSpots, ...allSpots]
      };
    }

    case ADD_SPOT_IMAGE: {
      const { id, spotId, url, preview } = action.payload;

      // Update the spot in the byId object
      const updatedSpot = {
        ...state.byId[spotId],
        SpotImages: [
          ...(state.byId[spotId]?.SpotImages || []),
          { id, url, preview }
        ]
      };

      // Update the spot in the allSpots array
      const updatedAllSpots = state.allSpots.map((spot) =>
        spot.id === spotId
          ? {
              ...spot,
              SpotImages: [...(spot.SpotImages || []), { id, url, preview }]
            }
          : spot
      );

      return {
        ...state,
        byId: { ...state.byId, [spotId]: updatedSpot },
        allSpots: updatedAllSpots
      };
    }

    case UPDATE_SPOT: {
      const { byId, allSpots } = _normalizeSpots([action.payload]);
      return {
        ...state,
        byId: { ...state.byId, ...byId },
        allSpots: [...state.allSpots, ...allSpots]
      };
    }

    case DELETE_SPOT: {
      const { [action.payload]: removed, ...restOfById } = state.byId;
      console.log(removed);
      const updatedAllSpots = state.allSpots.filter(
        (spot) => spot.id !== action.payload
      );

      return {
        ...state,
        byId: restOfById,
        allSpots: updatedAllSpots
      };
    }

    default:
      return state;
  }
};

/**
 * helper func to normalize the spot data so that it can be easily accessed by id.
 * @param {Array} spots
 */
function _normalizeSpots(spots) {
  const byId = {};
  const allSpots = [];

  spots.forEach((spot) => {
    byId[spot.id] = spot;
    allSpots.push(spot);
  });

  return { byId, allSpots };
}

export default spotsReducer;
