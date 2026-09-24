import currentTemplateContent from "@/data/current-template-content.json";
import type { Article, ContactChannel, LocaleCode, ProductCategory, SiteNavigationItem, UploadedFile } from "@/types/site";

export const defaultEnabledLocales: LocaleCode[] = ["en", "zh"];

export const defaultNavigation = currentTemplateContent.defaultNavigation as SiteNavigationItem[];

export const uploadedFiles = currentTemplateContent.uploadedFiles as UploadedFile[];

export const productCategories = currentTemplateContent.productCategories as ProductCategory[];

export const articles = currentTemplateContent.articles as Article[];

export const contactChannels: ContactChannel[] = [];

export const siteSettings = currentTemplateContent.siteSettings;
