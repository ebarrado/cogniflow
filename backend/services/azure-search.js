const { SearchClient, AzureKeyCredential, SearchIndexClient } = require("@azure/search-documents");

class AzureSearchService {
  constructor() {
    this.endpoint = process.env.AZURE_SEARCH_ENDPOINT;
    this.apiKey = process.env.AZURE_SEARCH_KEY;
    this.indexName = "profilesense-global";
    this.indexerName = "profilesense-global-indexer";
  }

  async init() {
    try {
      // Verificar se o index existe
      const indexClient = new SearchIndexClient(this.endpoint, new AzureKeyCredential(this.apiKey));
      
      const indexes = await indexClient.listIndexes();
      let indexExists = false;
      
      for await (const index of indexes) {
        if (index.name === this.indexName) {
          indexExists = true;
          break;
        }
      }
      
      if (!indexExists) {
        console.log('📚 Criando índice no Azure Search...');
        await this.createIndex();
      }
      
      console.log('✅ Azure Search configurado');
      return true;
    } catch (error) {
      console.error('❌ Erro ao configurar Azure Search:', error.message);
      return false;
    }
  }

  async createIndex() {
    const indexDefinition = {
      name: this.indexName,
      fields: [
        { name: "id", type: "Edm.String", key: true, filterable: true },
        { name: "userId", type: "Edm.String", filterable: true, searchable: true },
        { name: "sessionId", type: "Edm.String", filterable: true },
        { name: "timestamp", type: "Edm.DateTimeOffset", filterable: true, sortable: true },
        { name: "cognitiveState", type: "Edm.String", filterable: true, facetable: true },
        { name: "cognitiveScore_executivo", type: "Edm.Int32", filterable: true },
        { name: "cognitiveScore_contextual", type: "Edm.Int32", filterable: true },
        { name: "cognitiveScore_fonologico", type: "Edm.Int32", filterable: true },
        { name: "wordCount", type: "Edm.Int32", filterable: true },
        { name: "content", type: "Edm.String", searchable: true }
      ]
    };
    
    const indexClient = new SearchIndexClient(this.endpoint, new AzureKeyCredential(this.apiKey));
    await indexClient.createIndex(indexDefinition);
    console.log('✅ Índice criado:', this.indexName);
  }

  async indexDocument(document) {
    try {
      const searchClient = new SearchClient(
        this.endpoint,
        this.indexName,
        new AzureKeyCredential(this.apiKey)
      );
      
      // Preparar documento para indexação
      const indexedDoc = {
        id: document.id || `${document.userId}_${Date.now()}`,
        userId: document.userId || document.sessionId,
        sessionId: document.sessionId,
        timestamp: document.timestamp || new Date().toISOString(),
        cognitiveState: document.cognitive?.state?.[0] || 'neutro',
        cognitiveScore_executivo: document.cognitive?.score?.executivo || 0,
        cognitiveScore_contextual: document.cognitive?.score?.contextual || 0,
        cognitiveScore_fonologico: document.cognitive?.score?.fonologico || 0,
        wordCount: document.metrics?.wordCount || 0,
        content: document.conteudo || document.text || ''
      };
      
      await searchClient.uploadDocuments([indexedDoc]);
      console.log(`📚 Documento indexado: ${indexedDoc.id}`);
      return true;
    } catch (error) {
      console.error('❌ Erro ao indexar documento:', error.message);
      return false;
    }
  }

  async search(userId, query = '*', top = 20) {
    try {
      const searchClient = new SearchClient(
        this.endpoint,
        this.indexName,
        new AzureKeyCredential(this.apiKey)
      );
      
      const searchOptions = {
        filter: `userId eq '${userId}'`,
        top: top,
        orderBy: ["timestamp desc"]
      };
      
      const results = await searchClient.search(query, searchOptions);
      
      const documents = [];
      for await (const result of results.results) {
        documents.push(result.document);
      }
      
      console.log(`📚 Encontrados ${documents.length} documentos para ${userId}`);
      return documents;
    } catch (error) {
      console.error('❌ Erro na busca:', error.message);
      return [];
    }
  }
}

module.exports = new AzureSearchService();