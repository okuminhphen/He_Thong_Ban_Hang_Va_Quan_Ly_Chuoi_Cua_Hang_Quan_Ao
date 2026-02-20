// Utility functions for managing cart in localStorage (for non-logged-in users)

const CART_STORAGE_KEY = "guest_cart";

/**
 * Get cart from localStorage
 */
export const getLocalStorageCart = () => {
  try {
    const cartData = localStorage.getItem(CART_STORAGE_KEY);
    return cartData ? JSON.parse(cartData) : [];
  } catch (error) {
    console.error("Error reading cart from localStorage:", error);
    return [];
  }
};

/**
 * Save cart to localStorage
 */
export const saveLocalStorageCart = (cartItems) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  } catch (error) {
    console.error("Error saving cart to localStorage:", error);
  }
};

/**
 * Add item to localStorage cart
 */
export const addToLocalStorageCart = (item) => {
  const cartItems = getLocalStorageCart();

  // Check if item already exists (same productId and sizeId)
  const existingIndex = cartItems.findIndex(
    (cartItem) =>
      cartItem.productId === item.productId && cartItem.sizeId === item.sizeId
  );

  if (existingIndex !== -1) {
    // Update quantity if item exists
    cartItems[existingIndex].quantity += item.quantity;
  } else {
    // Add new item
    cartItems.push({
      ...item,
      id: `local_${Date.now()}_${Math.random()}`, // Generate temporary ID
    });
  }

  saveLocalStorageCart(cartItems);
  return cartItems;
};

/**
 * Update item quantity in localStorage cart
 */
export const updateLocalStorageCartItem = (itemId, quantity) => {
  const cartItems = getLocalStorageCart();
  const itemIndex = cartItems.findIndex((item) => item.id === itemId);

  if (itemIndex !== -1) {
    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      cartItems.splice(itemIndex, 1);
    } else {
      cartItems[itemIndex].quantity = quantity;
    }
    saveLocalStorageCart(cartItems);
  }

  return cartItems;
};

/**
 * Remove item from localStorage cart
 */
export const removeFromLocalStorageCart = (itemId) => {
  const cartItems = getLocalStorageCart();
  const filteredItems = cartItems.filter((item) => item.id !== itemId);
  saveLocalStorageCart(filteredItems);
  return filteredItems;
};

/**
 * Clear localStorage cart
 */
export const clearLocalStorageCart = () => {
  localStorage.removeItem(CART_STORAGE_KEY);
};

/**
 * Merge localStorage cart with server cart when user logs in
 */
export const mergeLocalStorageCartWithServer = async (
  localCartItems,
  userId,
  addItemToCartAPI
) => {
  try {
    // Add each item from localStorage to server cart
    for (const item of localCartItems) {
      try {
        await addItemToCartAPI({
          id: item.productId,
          userId: userId,
          sizeId: item.sizeId,
          quantity: item.quantity,
        });
      } catch (error) {
        console.error("Error merging cart item:", error);
      }
    }

    // Clear localStorage cart after merging
    clearLocalStorageCart();
  } catch (error) {
    console.error("Error merging carts:", error);
  }
};
