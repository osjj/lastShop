import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { CartItem, CartState, Product } from '@/types';
import { supabase } from '@/lib/supabase/client';

interface CartStore extends CartState {
  // Loading state for specific items
  loadingItems: Set<string>;
  loadingActions: Set<string>;
  
  // Actions
  addItem: (product: Product, quantity?: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  loadCart: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setItemLoading: (productId: string, loading: boolean) => void;
  setActionLoading: (actionId: string, loading: boolean) => void;
  isItemLoading: (productId: string) => boolean;
  isActionLoading: (actionId: string) => boolean;
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
        loadingItems: new Set(),
        loadingActions: new Set(),

        // Actions
        setLoading: (isLoading) =>
          set({ isLoading }, false, 'cart/setLoading'),

        setItemLoading: (productId, loading) => {
          const { loadingItems } = get();
          const newLoadingItems = new Set(loadingItems);
          if (loading) {
            newLoadingItems.add(productId);
          } else {
            newLoadingItems.delete(productId);
          }
          set({ loadingItems: newLoadingItems }, false, 'cart/setItemLoading');
        },

        setActionLoading: (actionId, loading) => {
          const { loadingActions } = get();
          const newLoadingActions = new Set(loadingActions);
          if (loading) {
            newLoadingActions.add(actionId);
          } else {
            newLoadingActions.delete(actionId);
          }
          set({ loadingActions: newLoadingActions }, false, 'cart/setActionLoading');
        },

        isItemLoading: (productId) => {
          const { loadingItems } = get();
          return loadingItems.has(productId);
        },

        isActionLoading: (actionId) => {
          const { loadingActions } = get();
          return loadingActions.has(actionId);
        },

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
          get().setItemLoading(product.id, true);

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

            get().setItemLoading(product.id, false);
          } catch (error) {
            get().setItemLoading(product.id, false);
            throw error;
          }
        },

        updateItem: async (itemId, quantity) => {
          if (quantity <= 0) {
            return get().removeItem(itemId);
          }

          get().setActionLoading(`update-${itemId}`, true);

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

            get().setActionLoading(`update-${itemId}`, false);
          } catch (error) {
            get().setActionLoading(`update-${itemId}`, false);
            throw error;
          }
        },

        removeItem: async (itemId) => {
          get().setActionLoading(`remove-${itemId}`, true);

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

            get().setActionLoading(`remove-${itemId}`, false);
          } catch (error) {
            get().setActionLoading(`remove-${itemId}`, false);
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
          // Don't persist loading states as they should be reset on page load
        }),
      }
    ),
    {
      name: 'cart-store',
    }
  )
);
