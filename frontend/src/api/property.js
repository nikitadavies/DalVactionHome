import * as api from "./utils";

/**
 * Fetches properties details
 */
export async function getProperties() {
    try {
      const response = await api.get("/properties");
      return response;
    } catch (error) {
      throw error;
    }
  }

/**
 * Get details of a property
 */
export async function getPropertyDetailsById(roomId) {
    try {
      const payload = { roomId }
      const response = await api.post(`/properties/details`, payload);
      return response;
    } catch (error) {
      throw error;
    }
  }

/**
 * Create room for property agents
 */
export async function addRoom(payload) {
  try {
    const response = await api.post(`/add-room`, payload);
    return response;
  } catch (error) {
    throw error;
  }
}


