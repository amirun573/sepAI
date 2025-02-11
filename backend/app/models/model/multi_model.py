from transformers import PreTrainedModel, PretrainedConfig, AutoConfig, AutoModel
import torch

# Define the custom configuration
class MultiModalityConfig(PretrainedConfig):
    model_type = "multi_modality"
    def __init__(self, vocab_size=30522, hidden_size=768, num_attention_heads=12, num_labels=2, **kwargs):
        super().__init__(**kwargs)
        self.vocab_size = vocab_size
        self.hidden_size = hidden_size
        self.num_attention_heads = num_attention_heads
        self.num_labels = num_labels

# Define the custom model
class MultiModalityModel(PreTrainedModel):
    config_class = MultiModalityConfig

    def __init__(self, config):
        super().__init__(config)
        self.embedding = torch.nn.Embedding(config.vocab_size, config.hidden_size)
        self.transformer = torch.nn.Transformer(d_model=config.hidden_size, nhead=config.num_attention_heads)
        self.classifier = torch.nn.Linear(config.hidden_size, config.num_labels)

    def forward(self, input_ids, attention_mask=None):
        embeddings = self.embedding(input_ids)
        transformer_output = self.transformer(embeddings)
        logits = self.classifier(transformer_output)
        return logits

# Register the custom model
AutoConfig.register("multi_modality", MultiModalityConfig)
AutoModel.register(MultiModalityConfig, MultiModalityModel)

# Load the model
# model_path = "/Users/amirun573/Downloads/cache/model/models--deepseek-ai--Janus-Pro-7B/snapshots/5c3eb3fb2a3b61094328465ba61fcd4272090d67/"
# model = AutoModel.from_pretrained(model_path)