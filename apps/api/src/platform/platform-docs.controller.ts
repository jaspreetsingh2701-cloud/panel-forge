import { Controller, Get, NotFoundException, Query, UseGuards } from '@nestjs/common';
import { readdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { PlatformSuperAdminGuard } from './platform-super-admin.guard';

type DocumentationEntry = { id: string; title: string; category: string; path: string };

@Controller('platform/docs')
@UseGuards(AccessTokenGuard, PlatformSuperAdminGuard)
export class PlatformDocsController {
  @Get()
  async list() {
    const root = this.repositoryRoot();
    const docsDirectory = join(root, 'docs');
    const files: string[] = [];
    await this.collectMarkdown(docsDirectory, root, files);
    for (const candidate of ['README.md', 'apps/api/README.md', 'apps/web/README.md']) {
      if (existsSync(join(root, candidate))) files.push(candidate);
    }
    return files.sort().map((path) => this.toEntry(path));
  }

  @Get('document')
  async document(@Query('path') requestedPath?: string) {
    if (!requestedPath || !/^(docs\\/.+|README\\.md|apps\\/(api|web)\\/README\\.md)$/.test(requestedPath) || !requestedPath.endsWith('.md')) {
      throw new NotFoundException('Documentation file not found.');
    }
    const root = this.repositoryRoot();
    const absolutePath = resolve(root, requestedPath);
    if (!absolutePath.startsWith(root + '/') || !existsSync(absolutePath)) {
      throw new NotFoundException('Documentation file not found.');
    }
    const content = await readFile(absolutePath, 'utf8');
    return { ...this.toEntry(requestedPath), content };
  }

  private repositoryRoot(): string {
    const candidates = [process.cwd(), resolve(process.cwd(), '../..'), resolve(__dirname, '../../../..'), resolve(__dirname, '../../../../..')];
    const root = candidates.find((candidate) => existsSync(join(candidate, 'docs')));
    if (!root) throw new NotFoundException('Documentation catalogue is not available in this deployment.');
    return root;
  }

  private async collectMarkdown(directory: string, root: string, files: string[]): Promise<void> {
    if (!existsSync(directory)) return;
    const entries = await readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
      const absolute = join(directory, entry.name);
      if (entry.isDirectory()) await this.collectMarkdown(absolute, root, files);
      else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) files.push(relative(root, absolute).split('\\\\').join('/'));
    }
  }

  private toEntry(path: string): DocumentationEntry {
    const fileName = path.split('/').pop() ?? path;
    const title = fileName.replace(/\\.md$/i, '').replace(/[-_]/g, ' ').replace(/\\b\\w/g, (letter) => letter.toUpperCase());
    const category = path.startsWith('docs/') ? path.split('/')[1].replace(/^\\d+-/, '').replace(/[-_]/g, ' ') : 'Project guides';
    return { id: path, title, category, path };
  }
}
