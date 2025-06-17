import { parsePRDToTypeSpec } from '../prd-parser';
import fs from 'fs';
import path from 'path';

describe('TypeSpec PRD Parser', () => {
  const samplePRD = fs.readFileSync(
    path.join(__dirname, '../../../examples/sample.prd'),
    'utf-8'
  );

  it('should generate valid TypeSpec from PRD', async () => {
    const { program } = await parsePRDToTypeSpec({ prd: samplePRD });
    expect(program.diagnostics).toHaveLength(0);
  });

  it('should throw error for invalid PRD', async () => {
    await expect(parsePRDToTypeSpec({ prd: '' }))
      .rejects
      .toThrow('No PRD provided');
  });

  it('should generate TypeSpec with proper models', async () => {
    const { program } = await parsePRDToTypeSpec({ prd: samplePRD });
    
    // Check for User model
    const userModel = program.models.find(m => m.name === 'User');
    expect(userModel).toBeDefined();
    expect(userModel?.properties).toContainEqual(
      expect.objectContaining({
        name: 'username',
        type: expect.any(Object)
      })
    );

    // Check for Role model
    const roleModel = program.models.find(m => m.name === 'Role');
    expect(roleModel).toBeDefined();
    expect(roleModel?.properties).toContainEqual(
      expect.objectContaining({
        name: 'name',
        type: expect.any(Object)
      })
    );

    // Check for Permission model
    const permissionModel = program.models.find(m => m.name === 'Permission');
    expect(permissionModel).toBeDefined();
    expect(permissionModel?.properties).toContainEqual(
      expect.objectContaining({
        name: 'name',
        type: expect.any(Object)
      })
    );
  });

  it('should include proper relationships', async () => {
    const { program } = await parsePRDToTypeSpec({ prd: samplePRD });
    
    // Check User-Role relationship
    const userModel = program.models.find(m => m.name === 'User');
    expect(userModel?.relationships).toContainEqual(
      expect.objectContaining({
        target: 'Role',
        type: 'many-to-many'
      })
    );

    // Check Role-Permission relationship
    const roleModel = program.models.find(m => m.name === 'Role');
    expect(roleModel?.relationships).toContainEqual(
      expect.objectContaining({
        target: 'Permission',
        type: 'many-to-many'
      })
    );
  });
}); 