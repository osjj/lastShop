import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { CartItem, CartState, Product } from '@/types';
import { supabase } from '@/lib/supabase/client';

interface CartStore extends CartState {
  // Actions
  addItem: (product: Product, quantity?: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  loadCart: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  calculateTotals: () => void;
}

export const useCartStore = create<CartStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        items: [],
        total: 0,
        itemCount: 0,
        isLoading: false,

        // Actions
        setLoading: (isLoading) =>
          set({ isLoading }, false, 'cart/setLoading'),

        calculateTotals: () => {
          const { items } = get();
          const total = items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );
          const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

          set({ total, itemCount }, false, 'cart/calculateTotals');
        },

        addItem: async (product, quantity = 1) => {
          set({ isLoading: true }, false, 'cart/addItem/start');

          try {
            // Check if user is authenticated
            const {
              data: { user },
            } = await supabase.auth.getUser();

            if (user) {
              // Add to database for authenticated users
              const { data, error } = await supabase
                .from('cart_items')
                .upsert(
                  {
                    user_id: user.id,
                    product_id: product.id,
                    quantity,
                    price: product.price,
                  },
                  {
                    onConflict: 'user_id,product_id',
                  }
                )
                .select('*')
                .single();

              if (error) throw error;

              // Reload cart from database
              await get().loadCart();
            } else {
              // Add to local state for guest users
              const { items } = get();
              const existingItem = items.find(
                (item) => item.productId === product.id
              );

              if (existingItem) {
                // Update existing item
                const updatedItems = items.map((item) =>
                  item.productId === product.id
                    ? { ...item, quantity: item.quantity + quantity }
                    : item
                );
                set({ items: updatedItems }, false, 'cart/addItem/update');
              } else {
                // Add new item
                const newItem: CartItem = {
                  id: `temp-${Date.now()}`,
                  productId: product.id,
                  product,
                  quantity,
                  price: product.price,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                };
                set(
                  { items: [...items, newItem] },
                  false,
                  'cart/addItem/new'
                );
              }

              get().calculateTotals();
            }

            set({ isLoading: false }, false, 'cart/addItem/success');
          } catch (error) {
            set({ isLoading: false }, false, 'cart/addItem/error');
            throw error;
          }
        },

        updateItem: async (itemId, quantity) => {
          if (quantity <= 0) {
            return get().removeItem(itemId);
          }

          set({ isLoading: true }, false, 'cart/updateItem/start');

          try {
            const {
              data: { user },
            } = await supabase.auth.getUser();

            if (user) {
              // Update in database
              const { error } = await supabase
                .from('cart_items')
                .update({ quantity, updated_at: new Date().toISOString() })
                .eq('id', itemId)
                .eq('user_id', user.id);

              if (error) throw error;

              // Reload cart from database
              await get().loadCart();
            } else {
              // Update local state
              const { items } = get();
              const updatedItems = items.map((item) =>
                item.id === itemId
                  ? { ...item, quantity, updatedAt: new Date().toISOString() }
                  : item
              );
              set({ items: updatedItems }, false, 'cart/updateItem/local');
              get().calculateTotals();
            }

            set({ isLoading: false }, false, 'cart/updateItem/success');
          } catch (error) {
            set({ isLoading: false }, false, 'cart/updateItem/error');
            throw error;
          }
        },

        removeItem: async (itemId) => {
          set({ isLoading: true }, false, 'cart/removeItem/start');

          try {
            const {
              data: { user },
            } = await supabase.auth.getUser();

            if (user) {
              // Remove from database
              const { error } = await supabase
                .from('cart_items')
                .delete()
                .eq('id', itemId)
                .eq('user_id', user.id);

              if (error) throw error;

              // Reload cart from database
              await get().loadCart();
            } else {
              // Remove from local state
              const { items } = get();
              const updatedItems = items.filter((item) => item.id !== itemId);
              set({ items: updatedItems }, false, 'cart/removeItem/local');
              get().calculateTotals();
            }

            set({ isLoading: false }, false, 'cart/removeItem/success');
          } catch (error) {
            set({ isLoading: false }, false, 'cart/removeItem/error');
            throw error;
          }
        },

        clearCart: async () => {
          set({ isLoading: true }, false, 'cart/clearCart/start');

          try {
            const {
              data: { user },
            } = await supabase.auth.getUser();

            if (user) {
              // Clear from database
              const { error } = await supabase
                .from('cart_items')
                .delete()
                .eq('user_id', user.id);

              if (error) throw error;
            }

            // Clear local state
            set(
              {
                items: [],
                total: 0,
                itemCount: 0,
                isLoading: false,
              },
              false,
              'cart/clearCart/success'
            );
          } catch (error) {
            set({ isLoading: false }, false, 'cart/clearCart/error');
            throw error;
          }
        },

        loadCart: async () => {
          set({ isLoading: true }, false, 'cart/loadCart/start');

          try {
            const {
              data: { user },
            } = await supabase.auth.getUser();

            if (user) {
              // Load from database
              const { data, error } = await supabase
                .from('cart_items')
                .select(
                  `
                  *,
                  product:products(*)
                `
                )
                .eq('user_id', user.id);

              if (error) throw error;

              const items: CartItem[] =
                data?.map((item) => ({
                  id: item.id,
                  productId: item.product_id,
                  product: item.product,
                  quantity: item.quantity,
                  price: item.price,
                  createdAt: item.created_at,
                  updatedAt: item.updated_at,
                })) || [];

              set({ items }, false, 'cart/loadCart/database');
            }
            // For guest users, items are already in local state

            get().calculateTotals();
            set({ isLoading: false }, false, 'cart/loadCart/success');
          } catch (error) {
            set({ isLoading: false }, false, 'cart/loadCart/error');
            throw error;
          }
        },
      }),
      {
        name: 'cart-store',
        partialize: (state) => ({
          items: state.items,
          total: state.total,
          itemCount: state.itemCount,
        }),
      }
    ),
    {
      name: 'cart-store',
    }
  )
);
