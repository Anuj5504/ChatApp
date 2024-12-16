import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";

export const fetchUser = createAsyncThunk(
  "auth/fetchUser",
  async (uid, { rejectWithValue }) => {
    if (!uid) return rejectWithValue("No user ID provided.");

    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        return rejectWithValue("User does not exist.");
      }

    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const fetchSlice = createSlice({
  name: "fetch",
  initialState: {
    curruser: null,
    loading: true,
  },
  reducers: {
    clearUser(state) {
      state.curruser = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
        state.curruser = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.curruser = action.payload;
        state.loading = false;
      })
      .addCase(fetchUser.rejected, (state) => {
        state.loading = false;
        state.curruser = null;
      });
  },
});

export const { clearUser } = fetchSlice.actions;

export default fetchSlice.reducer; 
