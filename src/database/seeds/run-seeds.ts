import { DataSource } from 'typeorm';
import dataSource from '../data-source';
import * as bcrypt from 'bcryptjs';
import { DbRole, DbUserStatus } from '../../contracts';
import { User, Project, Assignment, Milestone, Wallet } from '../entities';

async function seed() {
  const connection = await dataSource.initialize();

  try {
    const userRepository = connection.getRepository(User);
    const projectRepository = connection.getRepository(Project);
    const assignmentRepository = connection.getRepository(Assignment);
    const milestoneRepository = connection.getRepository(Milestone);
    const walletRepository = connection.getRepository(Wallet);

    // Create Admin
    const adminPassword = await bcrypt.hash('admin123', 10);
    let admin = await userRepository.findOne({ where: { email: 'admin@verisite.com' } });
    if (!admin) {
      admin = userRepository.create({
        fullName: 'Admin User',
        email: 'admin@verisite.com',
        passwordHash: adminPassword,
        role: DbRole.ADMIN,
        status: DbUserStatus.ACTIVE,
        isVerified: true,
        isActive: true,
      });
      admin = await userRepository.save(admin);
      console.log('✅ Admin user created');
    }

    // Create Client
    const clientPassword = await bcrypt.hash('client123', 10);
    let client = await userRepository.findOne({ where: { email: 'client@verisite.com' } });
    if (!client) {
      client = userRepository.create({
        fullName: 'Client User',
        email: 'client@verisite.com',
        passwordHash: clientPassword,
        role: DbRole.CLIENT,
        status: DbUserStatus.ACTIVE,
        isVerified: true,
        isActive: true,
      });
      client = await userRepository.save(client);

      // Create wallet for client
      const wallet = walletRepository.create({
        userId: client.id,
        balanceNgn: 1000000,
        verified: true,
      });
      await walletRepository.save(wallet);
      console.log('✅ Client user created');
    }

    // Create Developer
    const developerPassword = await bcrypt.hash('dev123', 10);
    let developer = await userRepository.findOne({ where: { email: 'developer@verisite.com' } });
    if (!developer) {
      developer = userRepository.create({
        fullName: 'Developer User',
        email: 'developer@verisite.com',
        passwordHash: developerPassword,
        role: DbRole.DEVELOPER,
        status: DbUserStatus.ACTIVE,
        isVerified: true,
        isActive: true,
      });
      developer = await userRepository.save(developer);
      console.log('✅ Developer user created');
    }

    // Create Field Ops
    const fieldOpsPassword = await bcrypt.hash('fieldops123', 10);
    let fieldOps = await userRepository.findOne({ where: { email: 'fieldops@verisite.com' } });
    if (!fieldOps) {
      fieldOps = userRepository.create({
        fullName: 'Field Ops User',
        email: 'fieldops@verisite.com',
        passwordHash: fieldOpsPassword,
        role: DbRole.FIELD_OPS,
        status: DbUserStatus.ACTIVE,
        isVerified: true,
        isActive: true,
      });
      fieldOps = await userRepository.save(fieldOps);
      console.log('✅ Field Ops user created');
    }

    // Create Sample Project
    let project = await projectRepository.findOne({ where: { name: 'Sample Construction Project' } });
    if (!project) {
      project = projectRepository.create({
        name: 'Sample Construction Project',
        description: 'A sample construction project for testing',
        typeOfConstruction: 'Duplex',
        city: 'Lagos',
        location: 'Victoria Island',
        clientId: client.id,
        developerId: developer.id,
        fieldOpsId: fieldOps.id,
        status: 'ONGOING' as any,
        progress: 45,
      });
      project = await projectRepository.save(project);
      console.log('✅ Sample project created');
    }

    // Create Sample Milestone
    let milestone = await milestoneRepository.findOne({ where: { projectId: project.id, name: 'FOUNDATION' as any } });
    if (!milestone) {
      milestone = milestoneRepository.create({
        projectId: project.id,
        name: 'FOUNDATION' as any,
        progress: 100,
        status: 'COMPLETED' as any,
        dateCompleted: new Date(),
      });
      await milestoneRepository.save(milestone);
      console.log('✅ Sample milestone created');
    }

    // Create Sample Assignment
    let assignment = await assignmentRepository.findOne({ where: { projectId: project.id } });
    if (!assignment) {
      assignment = assignmentRepository.create({
        projectId: project.id,
        fieldOpsId: fieldOps.id,
        milestone: 'FOUNDATION' as any,
        status: 'ONGOING' as any,
        assignedDate: new Date(),
        progressPercent: 75,
      });
      await assignmentRepository.save(assignment);
      console.log('✅ Sample assignment created');
    }

    console.log('\n🎉 Seeding completed successfully!');
    console.log('\nDefault credentials:');
    console.log('Admin: admin@verisite.com / admin123');
    console.log('Client: client@verisite.com / client123');
    console.log('Developer: developer@verisite.com / dev123');
    console.log('Field Ops: fieldops@verisite.com / fieldops123');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await connection.destroy();
  }
}

seed();

