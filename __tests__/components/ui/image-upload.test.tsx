import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next/image', () => ({
  default: (props: any) => <img {...props} />,
}));

import { ImageUpload } from '@/components/ui/image-upload';

describe('ImageUpload', () => {
  it('should render label', () => {
    render(<ImageUpload label="Avatar" onChange={vi.fn()} />);
    expect(screen.getByText('Avatar')).toBeInTheDocument();
  });

  it('should show placeholder when no preview', () => {
    render(<ImageUpload label="Photo" onChange={vi.fn()} />);
    expect(screen.getByText('Sin imagen')).toBeInTheDocument();
  });

  it('should show select button when no preview', () => {
    render(<ImageUpload label="Photo" onChange={vi.fn()} />);
    expect(screen.getByText('Seleccionar imagen')).toBeInTheDocument();
  });

  it('should show preview and change button when value provided', () => {
    render(<ImageUpload label="Photo" value="/test.jpg" onChange={vi.fn()} />);
    expect(screen.getByText('Cambiar imagen')).toBeInTheDocument();
    expect(screen.getByText('Eliminar')).toBeInTheDocument();
  });

  it('should show remove button when preview exists', () => {
    render(<ImageUpload label="Photo" value="/test.jpg" onChange={vi.fn()} />);
    expect(screen.getByText('Eliminar')).toBeInTheDocument();
  });

  it('should render multiple mode', () => {
    render(<ImageUpload label="Gallery" onChange={vi.fn()} multiple maxImages={3} />);
    expect(screen.getByText('Gallery')).toBeInTheDocument();
    expect(screen.getByText('+')).toBeInTheDocument();
  });

  it('should render with existing images in multiple mode', () => {
    render(
      <ImageUpload
        label="Gallery"
        onChange={vi.fn()}
        multiple
        maxImages={5}
        images={['/img1.jpg', '/img2.jpg']}
      />
    );
    expect(screen.getByText('Gallery')).toBeInTheDocument();
  });
});
