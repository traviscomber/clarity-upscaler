/**
 * Neural Status API Tests
 * Tests for Hugging Face ONNX model configuration and connectivity
 */

describe('Neural Status API', () => {
  describe('GET /api/neural-status', () => {
    it('should return configuration status without probe', async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/neural-status`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('ready');
      expect(data).toHaveProperty('configured');
      expect(data).toHaveProperty('backend');
      expect(data).toHaveProperty('model');
      expect(data).toHaveProperty('modelLocation');
    });

    it('should include probe results when probe=1 is passed', async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/neural-status?probe=1`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('probe');
      expect(data.probe).toHaveProperty('reachable');
      expect(data.probe).toHaveProperty('status');
    });

    it('should detect ONNX backend configuration', async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/neural-status`);
      const data = await response.json();

      if (process.env.N3URALIA_SR_BACKEND === 'onnx') {
        expect(data.backend).toBe('onnx');
        expect(data.configured).toBe(true);
      }
    });

    it('should include model metadata', async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/neural-status`);
      const data = await response.json();

      if (data.model) {
        expect(data.model).toHaveProperty('id');
        expect(data.model).toHaveProperty('name');
        expect(data.model).toHaveProperty('scale');
      }
    });

    it('should detect model location accessibility', async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/neural-status`);
      const data = await response.json();

      if (data.modelLocation) {
        expect(data.modelLocation).toHaveProperty('configured');
        expect(data.modelLocation).toHaveProperty('type');
      }
    });
  });

  describe('Model Fallback', () => {
    it('should support fallback to secondary model', async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/neural-status`);
      const data = await response.json();

      expect(data).toHaveProperty('fallbackModel');
      if (data.fallbackModel) {
        expect(data.fallbackModel).toHaveProperty('id');
        expect(data.fallbackModel).toHaveProperty('available');
      }
    });
  });
});
