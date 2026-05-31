import Brand from '../models/Brand.model.js';

// @desc    Get brand profile
// @route   GET /api/brand
// @access  Private
export const getBrandProfile = async (req, res, next) => {
  try {
    let brand = await Brand.findOne({ userId: req.user._id });

    if (!brand) {
      // Create empty brand profile if doesn't exist
      brand = await Brand.create({ userId: req.user._id });
    }

    res.json({
      success: true,
      data: brand
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update brand profile
// @route   PUT /api/brand
// @access  Private
export const updateBrandProfile = async (req, res, next) => {
  try {
    let brand = await Brand.findOne({ userId: req.user._id });

    if (!brand) {
      brand = await Brand.create({
        ...req.body,
        userId: req.user._id
      });
    } else {
      brand = await Brand.findByIdAndUpdate(
        brand._id,
        req.body,
        { new: true, runValidators: true }
      );
    }

    res.json({
      success: true,
      data: brand
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add LinkedIn post
// @route   POST /api/brand/linkedin/posts
// @access  Private
export const addLinkedInPost = async (req, res, next) => {
  try {
    const brand = await Brand.findOne({ userId: req.user._id });

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand profile not found'
      });
    }

    brand.linkedin.posts.push(req.body);
    brand.linkedin.lastUpdated = new Date();
    await brand.save();

    res.status(201).json({
      success: true,
      data: brand
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add Twitter tweet
// @route   POST /api/brand/twitter/tweets
// @access  Private
export const addTweet = async (req, res, next) => {
  try {
    const brand = await Brand.findOne({ userId: req.user._id });

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand profile not found'
      });
    }

    brand.twitter.tweets.push(req.body);
    brand.twitter.lastUpdated = new Date();
    await brand.save();

    res.status(201).json({
      success: true,
      data: brand
    });
  } catch (error) {
    next(error);
  }
};
