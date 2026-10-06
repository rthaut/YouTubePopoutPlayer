/**
 * Closes the specified browser window.
 * @param {number} windowId the ID of the window to close
 * @returns {Promise<boolean>} if the window was closed successfully
 */
export const CloseWindow = async (windowId: number): Promise<boolean> => {
  if (isNaN(windowId) || +windowId <= 0) {
    return false;
  }

  try {
    await browser.windows.remove(windowId);
  } catch (error) {
    console.error("[Background] CloseWindow() :: Error", error);
    return false;
  }

  return true;
};
