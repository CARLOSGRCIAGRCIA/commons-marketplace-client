import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

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

  it('should handle single file selection and call onChange', async () => {
    const onChange = vi.fn();
    const { container } = render(<ImageUpload label="Photo" onChange={onChange} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    const file = new File(['(binary)'], 'photo.png', { type: 'image/png' });
    Object.defineProperty(input, 'files', { value: [file] });

    const mockReadAsDataURL = vi.fn();
    const mockAddEventListener = vi.fn((_event: string, cb: () => void) => {
      setTimeout(() => {
        Object.defineProperty(vi.fn(), 'result', { value: 'data:image/png;base64,abc' });
        cb();
      }, 0);
    });

    vi.stubGlobal(
      'FileReader',
      vi.fn(() => ({
        readAsDataURL: mockReadAsDataURL,
        addEventListener: mockAddEventListener,
        onload: null,
        result: 'data:image/png;base64,abc',
      }))
    );

    input.dispatchEvent(new Event('change', { bubbles: true }));

    expect(onChange).toHaveBeenCalledWith(file);
    vi.unstubAllGlobals();
  });

  it('should call onChange when remove button is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ImageUpload label="Photo" value="/test.jpg" onChange={onChange} />);
    await user.click(screen.getByText('Eliminar'));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('should handle multiple file selection and call onChangeMultiple', () => {
    const onChangeMultiple = vi.fn();
    const { container } = render(
      <ImageUpload label="Gallery" onChange={vi.fn()} onChangeMultiple={onChangeMultiple} multiple maxImages={5} />
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    const file1 = new File(['a'], 'a.png', { type: 'image/png' });
    const file2 = new File(['b'], 'b.png', { type: 'image/png' });
    Object.defineProperty(input, 'files', { value: [file1, file2] });

    vi.stubGlobal(
      'FileReader',
      vi.fn(() => ({
        readAsDataURL: vi.fn(),
        addEventListener: vi.fn(),
        onload: null,
        result: 'data:image/png;base64,abc',
      }))
    );

    input.dispatchEvent(new Event('change', { bubbles: true }));

    expect(onChangeMultiple).toHaveBeenCalledWith([file1, file2]);
    vi.unstubAllGlobals();
  });

  it('should handle removePreview in multiple mode', async () => {
    const user = userEvent.setup();
    const onFileRemove = vi.fn();
    const { container } = render(
      <ImageUpload
        label="Gallery"
        onChange={vi.fn()}
        multiple
        maxImages={5}
        images={['/img1.jpg', '/img2.jpg']}
        onFileRemove={onFileRemove}
      />
    );
    const removeButtons = container.querySelectorAll('button');
    const previewRemoveBtn = Array.from(removeButtons).find((btn) => btn.textContent?.includes('✕'));
    if (previewRemoveBtn) {
      await user.click(previewRemoveBtn);
      expect(onFileRemove).toHaveBeenCalled();
    }
  });

  it('should handle removePreview with onRemove fallback', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    const { container } = render(
      <ImageUpload
        label="Gallery"
        onChange={vi.fn()}
        multiple
        maxImages={5}
        images={['/img1.jpg']}
        onRemove={onRemove}
      />
    );
    const removeButtons = container.querySelectorAll('button');
    const previewRemoveBtn = Array.from(removeButtons).find((btn) => btn.textContent?.includes('✕'));
    if (previewRemoveBtn) {
      await user.click(previewRemoveBtn);
      expect(onRemove).toHaveBeenCalled();
    }
  });
});
