const express = require("express");
const { SpotImage, Spot } = require("../../db/models");
const { requireAuth } = require("../../utils/auth");
const router = express.Router({ mergeParams: true });

//  Delete a spot image

router.delete("/:id", requireAuth, async (req, res, next) => {
  const imageId = req.params.id;
  const userId = req.user.id;

  try {
    // Find the SpotImage with its associated Spot
    const image = await SpotImage.findByPk(imageId, {
      include: {
        model: Spot,
        attributes: ["ownerId"],
      },
    });

    // Return 404 if the image doesn't exist
    if (!image) {
      return res.status(404).json({ message: "Spot Image couldn't be found" });
    }

    // Check if the current user is the owner of the spot
    if (image.Spot.ownerId !== userId) {
      return res
        .status(403)
        .json({ message: "Forbidden: Spot does not belong to current user" });
    }

    // Delete the image
    await image.destroy();
    return res.status(200).json({ message: "Successfully deleted" });
  } catch (error) {
    next(error);
  }
});



module.exports = router;
