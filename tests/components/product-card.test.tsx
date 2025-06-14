import { render, screen, fireEvent } from '@testing-library/react';
import { ProductCard } from '@/components/product/product-card';
import { Product } from '@/types';

// Mock the cart store
jest.mock('@/store/cart', () => ({
  useCartStore: () => ({
    addItem: jest.fn(),
    isLoading: false,
  }),
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

const mockProduct: Product = {
  id: '1',
  name: 'Test Product',
  slug: 'test-product',
  description: 'This is a test product',
  shortDescription: 'Test product description',
  sku: 'TEST-001',
  price: 99.99,
  originalPrice: 129.99,
  categoryId: 'cat-1',
  brandId: 'brand-1',
  stockQuantity: 10,
  images: ['https://example.com/image.jpg'],
  status: 'active',
  isFeatured: true,
  isDigital: false,
  rating: 4.5,
  reviewCount: 25,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('ProductCard', () => {
  it('renders product information correctly', () => {
    render(<ProductCard product={mockProduct} />);
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('Test product description')).toBeInTheDocument();
    expect(screen.getByText('¥99.99')).toBeInTheDocument();
    expect(screen.getByText('¥129.99')).toBeInTheDocument();
    expect(screen.getByText('(25)')).toBeInTheDocument();
  });

  it('shows discount percentage', () => {
    render(<ProductCard product={mockProduct} />);
    
    expect(screen.getByText('-23%')).toBeInTheDocument();
  });

  it('shows out of stock when stock is 0', () => {
    const outOfStockProduct = { ...mockProduct, stockQuantity: 0 };
    render(<ProductCard product={outOfStockProduct} />);
    
    expect(screen.getByText('缺货')).toBeInTheDocument();
  });

  it('calls addItem when add to cart button is clicked', () => {
    const mockAddItem = jest.fn();
    jest.mocked(require('@/store/cart').useCartStore).mockReturnValue({
      addItem: mockAddItem,
      isLoading: false,
    });

    render(<ProductCard product={mockProduct} />);
    
    const addToCartButton = screen.getByText('加入购物车');
    fireEvent.click(addToCartButton);
    
    expect(mockAddItem).toHaveBeenCalledWith(mockProduct, 1);
  });
});
